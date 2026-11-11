<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Enums\SaleStatus;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Services\AuditLogger;
use App\Services\InvoiceService;
use App\Services\NotificationService;
use App\Services\StockService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function __construct(private readonly StockService $stockService) {}

    public function index(Request $request): Response
    {
        $sales = Sale::query()
            ->with(['customer:id,name', 'user:id,name', 'items:id,sale_id,product_id,quantity'])
            ->when($request->search, fn ($q, $s) => $q->where('invoice_no', 'like', "%{$s}%"))
            ->when($request->customer_id, fn ($q, $id) => $q->where('customer_id', $id))
            ->when($request->status, fn ($q, $s) => $q->where('payment_status', $s))
            ->when($request->from, fn ($q, $d) => $q->whereDate('date', '>=', $d))
            ->when($request->to, fn ($q, $d) => $q->whereDate('date', '<=', $d))
            ->latest()
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        return Inertia::render('sales/index', [
            'sales' => $sales,
            'filters' => $request->only(['search', 'customer_id', 'status', 'from', 'to']),
            'customers' => Customer::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function pos(): Response
    {
        return Inertia::render('sales/pos', [
            'products' => Product::query()
                ->with('category:id,name')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'sku', 'barcode', 'image', 'selling_price', 'discount_price', 'stock_qty', 'category_id']),
            'customers' => Customer::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'customer_id' => ['nullable', 'exists:customers,id'],
            'date' => ['required', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.discount' => ['nullable', 'numeric', 'min:0'],
            'discount' => ['required', 'numeric', 'min:0'],
            'tax' => ['required', 'numeric', 'min:0'],
            'paid' => ['required', 'numeric', 'min:0'],
            'payment_method' => ['nullable', 'string'],
            'note' => ['nullable', 'string'],
        ]);

        $sale = DB::transaction(function () use ($data) {
            $subtotal = collect($data['items'])->sum(fn ($i) => $i['quantity'] * $i['unit_price']);
            $total = $subtotal - $data['discount'] + $data['tax'];
            $paid = min($data['paid'], $total);

            $sale = Sale::query()->create([
                'invoice_no' => InvoiceService::saleInvoiceNo(),
                'customer_id' => $data['customer_id'] ?? null,
                'date' => $data['date'],
                'subtotal' => $subtotal,
                'discount' => $data['discount'],
                'tax' => $data['tax'],
                'total' => $total,
                'paid' => $paid,
                'due' => $total - $paid,
                'payment_status' => PaymentStatus::fromAmounts($total, $paid)->value,
                'payment_method' => $data['payment_method'] ?? 'cash',
                'status' => SaleStatus::Completed->value,
                'note' => $data['note'] ?? null,
                'user_id' => auth()->id(),
            ]);

            foreach ($data['items'] as $item) {
                $sale->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'discount' => $item['discount'] ?? 0,
                    'total' => $item['quantity'] * $item['unit_price'],
                ]);

                $this->stockService->decrease(
                    \App\Enums\StockMovementType::Sale,
                    $item['product_id'],
                    $item['quantity'],
                    Sale::class,
                    $sale->id,
                    "Sale {$sale->invoice_no}",
                );
            }

            if ($paid > 0) {
                $sale->payments()->create([
                    'date' => $data['date'],
                    'amount' => $paid,
                    'payment_method' => $data['payment_method'] ?? 'cash',
                    'user_id' => auth()->id(),
                ]);
            }

            if ($sale->customer_id && $sale->due > 0) {
                $sale->customer->increment('balance', $sale->due);
            }

            return $sale;
        });

        NotificationService::notify(
            'sale',
            "New sale {$sale->invoice_no}",
            "Sale recorded for ".number_format($sale->total, 2)." on ".$sale->date->format('d M Y'),
            route('sales.index'),
        );

        AuditLogger::log('create', $sale, "Created sale {$sale->invoice_no}");

        return redirect()
            ->route('sales.show', $sale)
            ->with('success', 'Sale completed and stock updated.');
    }

    public function show(Sale $sale): Response
    {
        $sale->load(['customer', 'user:id,name', 'items.product:id,name,sku,image', 'payments.user:id,name']);

        return Inertia::render('sales/show', ['sale' => $sale]);
    }

    public function invoice(Sale $sale)
    {
        $sale->load(['customer', 'items.product:id,name,sku']);

        $pdf = Pdf::loadView('pdf.sale', ['sale' => $sale])->setPaper('a4');

        return $pdf->download("invoice-{$sale->invoice_no}.pdf");
    }

    public function return(Request $request, Sale $sale): RedirectResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'refund_amount' => ['required', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($data, $sale) {
            foreach ($data['items'] as $item) {
                $saleItem = $sale->items()->where('product_id', $item['product_id'])->firstOrFail();

                $this->stockService->increase(
                    \App\Enums\StockMovementType::SaleReturn,
                    $item['product_id'],
                    $item['quantity'],
                    Sale::class,
                    $sale->id,
                    "Return on {$sale->invoice_no}",
                );

                $saleItem->update([
                    'quantity' => max(0, $saleItem->quantity - $item['quantity']),
                    'total' => max(0, $saleItem->quantity * $saleItem->unit_price),
                ]);
            }

            $sale->update([
                'total' => max(0, $sale->total - $data['refund_amount']),
                'due' => max(0, $sale->due - $data['refund_amount']),
                'payment_status' => PaymentStatus::fromAmounts(max(0, $sale->total - $data['refund_amount']), $sale->paid)->value,
            ]);

            if ($sale->customer_id) {
                $sale->customer->decrement('balance', $data['refund_amount']);
            }
        });

        NotificationService::notify(
            'sale',
            "Sale returned on {$sale->invoice_no}",
            "Refund of ".number_format($data['refund_amount'], 2)." processed.",
            route('sales.index'),
        );

        AuditLogger::log('update', $sale, "Returned items on sale {$sale->invoice_no}");

        return back()->with('success', 'Sale return processed and stock updated.');
    }

    public function destroy(Sale $sale): RedirectResponse
    {
        DB::transaction(function () use ($sale) {
            foreach ($sale->items as $item) {
                $this->stockService->increase(
                    \App\Enums\StockMovementType::SaleReturn,
                    $item->product_id,
                    $item->quantity,
                    Sale::class,
                    $sale->id,
                    "Deleted sale {$sale->invoice_no}",
                );
            }

            if ($sale->customer_id && $sale->due > 0) {
                $sale->customer->decrement('balance', $sale->due);
            }

            $sale->delete();
        });

        AuditLogger::log('delete', $sale, "Deleted sale {$sale->invoice_no}");

        return redirect()
            ->route('sales.index')
            ->with('success', 'Sale deleted and stock reverted.');
    }
}
