<?php

namespace App\Http\Controllers;

use App\Enums\StockMovementType;
use App\Models\Product;
use App\Models\StockMovement;
use App\Services\AuditLogger;
use App\Services\NotificationService;
use App\Services\StockService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function __construct(private readonly StockService $stockService) {}

    public function index(Request $request): Response
    {
        $movements = StockMovement::query()
            ->with(['product:id,name,sku,image', 'user:id,name'])
            ->when($request->product_id, fn ($q, $id) => $q->where('product_id', $id))
            ->when($request->type, fn ($q, $t) => $q->where('type', $t))
            ->when($request->from, fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($request->to, fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->latest()
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        return Inertia::render('stock/index', [
            'movements' => $movements,
            'filters' => $request->only(['product_id', 'type', 'from', 'to']),
            'products' => Product::query()->orderBy('name')->get(['id', 'name', 'sku']),
            'types' => StockMovementType::options(),
        ]);
    }

    public function adjust(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'type' => ['required', 'in:adjustment,damaged'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $type = $data['type'] === 'damaged' ? StockMovementType::Damaged : StockMovementType::Adjustment;

        $this->stockService->move($type, $data['product_id'], $data['quantity'], note: $data['note']);

        AuditLogger::log('update', Product::find($data['product_id']), "{$type->label()} of {$data['quantity']}");

        return back()->with('success', 'Stock adjusted successfully.');
    }

    public function transfer(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'from_product_id' => ['required', 'exists:products,id'],
            'to_product_id' => ['required', 'exists:products,id', 'different:from_product_id'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
        ]);

        $this->stockService->decrease(
            StockMovementType::TransferOut,
            $data['from_product_id'],
            $data['quantity'],
            note: "Transferred to product #{$data['to_product_id']}",
        );
        $this->stockService->increase(
            StockMovementType::TransferIn,
            $data['to_product_id'],
            $data['quantity'],
            note: "Transferred from product #{$data['from_product_id']}",
        );

        AuditLogger::log('update', Product::find($data['from_product_id']), "Transferred {$data['quantity']} to product #{$data['to_product_id']}");

        return back()->with('success', 'Stock transferred successfully.');
    }

    public function lowStock(): Response
    {
        $products = Product::query()
            ->with('category:id,name')
            ->whereColumn('stock_qty', '<=', 'min_stock')
            ->latest()
            ->paginate(20);

        return Inertia::render('stock/low-stock', [
            'products' => $products,
        ]);
    }

    public function stockReport(): Response
    {
        $products = Product::query()
            ->with('category:id,name')
            ->latest()
            ->paginate(20);

        return Inertia::render('stock/report', [
            'products' => $products,
        ]);
    }

    public function exportCsv(Request $request)
    {
        $query = Product::query()->with('category:id,name', 'brand:id,name')->latest();

        $filename = 'stock-report-'.now()->format('Y-m-d-His').'.csv';

        return response()->streamDownload(function () use ($query) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, ['Name', 'SKU', 'Barcode', 'Category', 'Brand', 'Stock Qty', 'Min Stock', 'Cost Price', 'Selling Price', 'Stock Value', 'Status']);

            $query->chunk(500, function ($products) use ($out) {
                foreach ($products as $p) {
                    fputcsv($out, [
                        $p->name,
                        $p->sku,
                        $p->barcode,
                        $p->category?->name,
                        $p->brand?->name,
                        $p->stock_qty,
                        $p->min_stock,
                        $p->cost_price,
                        $p->selling_price,
                        number_format((float) $p->stock_qty * (float) $p->cost_price, 2),
                        $p->stock_qty <= 0 ? 'Out of stock' : ($p->stock_qty <= $p->min_stock ? 'Low' : 'OK'),
                    ]);
                }
            });

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}
