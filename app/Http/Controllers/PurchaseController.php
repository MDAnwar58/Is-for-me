<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Supplier;
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

class PurchaseController extends Controller
{
    public function __construct(private readonly StockService $stockService) {}

    public function index(Request $request): Response
    {
        $purchases = Purchase::query()
            ->with(['supplier:id,name', 'user:id,name', 'items:id,purchase_id,product_id,quantity'])
            ->when($request->search, fn ($q, $s) => $q->where('invoice_no', 'like', "%{$s}%"))
            ->when($request->supplier_id, fn ($q, $id) => $q->where('supplier_id', $id))
            ->when($request->status, fn ($q, $s) => $q->where('payment_status', $s))
            ->when($request->from, fn ($q, $d) => $q->whereDate('date', '>=', $d))
            ->when($request->to, fn ($q, $d) => $q->whereDate('date', '<=', $d))
            ->latest()
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        return Inertia::render('purchases/index', [
            'purchases' => $purchases,
            'filters' => $request->only(['search', 'supplier_id', 'status', 'from', 'to']),
            'suppliers' => Supplier::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('purchases/create', [
            'suppliers' => Supplier::query()->orderBy('name')->get(['id', 'name']),
            'products' => Product::query()
                ->with('category:id,name')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'sku', 'barcode', 'cost_price', 'selling_price', 'stock_qty', 'category_id', 'purchase_limit']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'date' => ['required', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'items.*.unit_cost' => ['required', 'numeric', 'min:0'],
            'discount' => ['required', 'numeric', 'min:0'],
            'tax' => ['required', 'numeric', 'min:0'],
            'paid' => ['required', 'numeric', 'min:0'],
            'payment_method' => ['nullable', 'string'],
            'note' => ['nullable', 'string'],
        ]);

        $purchase = DB::transaction(function () use ($data) {
            $subtotal = collect($data['items'])->sum(fn ($i) => $i['quantity'] * $i['unit_cost']);
            $total = $subtotal - $data['discount'] + $data['tax'];
            $paid = min($data['paid'], $total);

            $purchase = Purchase::query()->create([
                'invoice_no' => InvoiceService::purchaseInvoiceNo(),
                'supplier_id' => $data['supplier_id'] ?? null,
                'date' => $data['date'],
                'subtotal' => $subtotal,
                'discount' => $data['discount'],
                'tax' => $data['tax'],
                'total' => $total,
                'paid' => $paid,
                'due' => $total - $paid,
                'payment_status' => PaymentStatus::fromAmounts($total, $paid)->value,
                'payment_method' => $data['payment_method'] ?? 'cash',
                'status' => 'received',
                'note' => $data['note'] ?? null,
                'user_id' => auth()->id(),
            ]);

            foreach ($data['items'] as $item) {
                $purchase->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'],
                    'total' => $item['quantity'] * $item['unit_cost'],
                ]);

                $this->stockService->increase(
                    \App\Enums\StockMovementType::Purchase,
                    $item['product_id'],
                    $item['quantity'],
                    Purchase::class,
                    $purchase->id,
                    "Purchase {$purchase->invoice_no}",
                );
            }

            if ($paid > 0) {
                $purchase->payments()->create([
                    'date' => $data['date'],
                    'amount' => $paid,
                    'payment_method' => $data['payment_method'] ?? 'cash',
                    'user_id' => auth()->id(),
                ]);
            }

            if ($purchase->supplier_id && $purchase->due > 0) {
                $purchase->supplier->increment('balance', $purchase->due);
            }

            return $purchase;
        });

        NotificationService::notify(
            'purchase',
            "New purchase {$purchase->invoice_no}",
            "Purchase recorded for ".number_format($purchase->total, 2)." on ".$purchase->date->format('d M Y'),
            route('purchases.index'),
        );

        AuditLogger::log('create', $purchase, "Created purchase {$purchase->invoice_no}");

        return redirect()
            ->route('purchases.show', $purchase)
            ->with('success', 'Purchase created and stock updated.');
    }

    public function show(Purchase $purchase): Response
    {
        $purchase->load(['supplier', 'user:id,name', 'items.product:id,name,sku,image', 'payments.user:id,name']);

        return Inertia::render('purchases/show', ['purchase' => $purchase]);
    }

    public function invoice(Purchase $purchase)
    {
        $purchase->load(['supplier', 'items.product:id,name,sku']);

        $pdf = Pdf::loadView('pdf.purchase', ['purchase' => $purchase])->setPaper('a4');

        return $pdf->download("purchase-{$purchase->invoice_no}.pdf");
    }

    public function updateStatus(Request $request, Purchase $purchase): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:ordered,received,cancelled'],
        ]);

        $purchase->update($data);

        AuditLogger::log('update', $purchase, "Updated purchase {$purchase->invoice_no} status to {$data['status']}");

        return back()->with('success', 'Purchase status updated.');
    }

    public function destroy(Purchase $purchase): RedirectResponse
    {
        DB::transaction(function () use ($purchase) {
            foreach ($purchase->items as $item) {
                $this->stockService->decrease(
                    \App\Enums\StockMovementType::PurchaseReturn,
                    $item->product_id,
                    $item->quantity,
                    Purchase::class,
                    $purchase->id,
                    "Deleted purchase {$purchase->invoice_no}",
                );
            }

            if ($purchase->supplier_id && $purchase->due > 0) {
                $purchase->supplier->decrement('balance', $purchase->due);
            }

            $purchase->delete();
        });

        AuditLogger::log('delete', $purchase, "Deleted purchase {$purchase->invoice_no}");

        return redirect()
            ->route('purchases.index')
            ->with('success', 'Purchase deleted and stock reverted.');
    }
}
