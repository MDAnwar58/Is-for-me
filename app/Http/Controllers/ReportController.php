<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Supplier;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $from = Carbon::parse($request->date('from') ?? Carbon::now()->startOfMonth());
        $to = Carbon::parse($request->date('to') ?? Carbon::now());

        $sales = (float) Sale::query()
            ->whereBetween('date', [$from, $to])
            ->where('status', '!=', 'cancelled')
            ->sum('total');
        $saleCount = Sale::query()
            ->whereBetween('date', [$from, $to])
            ->where('status', '!=', 'cancelled')
            ->count();
        $purchases = (float) Purchase::query()
            ->whereBetween('date', [$from, $to])
            ->where('status', '!=', 'cancelled')
            ->sum('total');
        $purchaseCount = Purchase::query()
            ->whereBetween('date', [$from, $to])
            ->where('status', '!=', 'cancelled')
            ->count();
        $expenses = (float) Expense::query()->whereBetween('date', [$from, $to])->sum('amount');

        $costOfGoodsSold = SaleItem::query()
            ->whereHas('sale', fn ($q) => $q->whereBetween('date', [$from, $to])->where('status', '!=', 'cancelled'))
            ->with('product:id,cost_price')
            ->get()
            ->sum(fn ($i) => (float) $i->quantity * (float) $i->product?->cost_price);

        $profit = $sales - $costOfGoodsSold - $expenses;

        $daily = collect(range(0, $from->diffInDays($to)))->map(function (int $i) use ($from) {
            $date = $from->copy()->addDays($i);

            return [
                'date' => $date->format('Y-m-d'),
                'label' => $date->format('d M'),
                'sales' => (float) Sale::query()->whereDate('date', $date)->where('status', '!=', 'cancelled')->sum('total'),
                'purchases' => (float) Purchase::query()->whereDate('date', $date)->where('status', '!=', 'cancelled')->sum('total'),
            ];
        });

        $topProducts = SaleItem::query()
            ->whereHas('sale', fn ($q) => $q->whereBetween('date', [$from, $to])->where('status', '!=', 'cancelled'))
            ->selectRaw('product_id, SUM(quantity) as total_qty, SUM(total) as total_sales')
            ->with('product:id,name,sku')
            ->groupBy('product_id')
            ->orderByDesc('total_sales')
            ->limit(5)
            ->get();

        return Inertia::render('reports/index', [
            'from' => $from->format('Y-m-d'),
            'to' => $to->format('Y-m-d'),
            'summary' => [
                'sales' => $sales,
                'sale_count' => $saleCount,
                'purchases' => $purchases,
                'purchase_count' => $purchaseCount,
                'expenses' => $expenses,
                'profit' => $profit,
            ],
            'daily' => $daily,
            'top_products' => $topProducts,
        ]);
    }

    public function sales(Request $request): Response
    {
        $sales = Sale::query()
            ->with(['customer:id,name', 'user:id,name'])
            ->when($request->from, fn ($q, $d) => $q->whereDate('date', '>=', $d))
            ->when($request->to, fn ($q, $d) => $q->whereDate('date', '<=', $d))
            ->when($request->status, fn ($q, $s) => $q->where('payment_status', $s))
            ->latest()
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        $total = (float) Sale::query()
            ->when($request->from, fn ($q, $d) => $q->whereDate('date', '>=', $d))
            ->when($request->to, fn ($q, $d) => $q->whereDate('date', '<=', $d))
            ->where('status', '!=', 'cancelled')
            ->sum('total');

        return Inertia::render('reports/sales', [
            'sales' => $sales,
            'filters' => $request->only(['from', 'to', 'status']),
            'total' => $total,
        ]);
    }

    public function purchases(Request $request): Response
    {
        $purchases = Purchase::query()
            ->with(['supplier:id,name', 'user:id,name'])
            ->when($request->from, fn ($q, $d) => $q->whereDate('date', '>=', $d))
            ->when($request->to, fn ($q, $d) => $q->whereDate('date', '<=', $d))
            ->when($request->status, fn ($q, $s) => $q->where('payment_status', $s))
            ->latest()
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        $total = (float) Purchase::query()
            ->when($request->from, fn ($q, $d) => $q->whereDate('date', '>=', $d))
            ->when($request->to, fn ($q, $d) => $q->whereDate('date', '<=', $d))
            ->where('status', '!=', 'cancelled')
            ->sum('total');

        return Inertia::render('reports/purchases', [
            'purchases' => $purchases,
            'filters' => $request->only(['from', 'to', 'status']),
            'total' => $total,
        ]);
    }

    public function profitLoss(Request $request): Response
    {
        $from = Carbon::parse($request->date('from') ?? Carbon::now()->startOfMonth());
        $to = Carbon::parse($request->date('to') ?? Carbon::now());

        $sales = (float) Sale::query()->whereBetween('date', [$from, $to])->where('status', '!=', 'cancelled')->sum('total');
        $purchases = (float) Purchase::query()->whereBetween('date', [$from, $to])->where('status', '!=', 'cancelled')->sum('total');
        $expenses = (float) Expense::query()->whereBetween('date', [$from, $to])->sum('amount');

        $costOfGoodsSold = SaleItem::query()
            ->whereHas('sale', fn ($q) => $q->whereBetween('date', [$from, $to])->where('status', '!=', 'cancelled'))
            ->with('product:id,cost_price')
            ->get()
            ->sum(fn ($i) => (float) $i->quantity * (float) $i->product?->cost_price);

        $grossProfit = $sales - $costOfGoodsSold;
        $netProfit = $grossProfit - $expenses;

        return Inertia::render('reports/profit-loss', [
            'from' => $from->format('Y-m-d'),
            'to' => $to->format('Y-m-d'),
            'data' => [
                'sales' => $sales,
                'cogs' => $costOfGoodsSold,
                'gross_profit' => $grossProfit,
                'expenses' => $expenses,
                'net_profit' => $netProfit,
            ],
        ]);
    }

    public function expenses(Request $request): Response
    {
        $expenses = Expense::query()
            ->with(['category:id,name', 'user:id,name'])
            ->when($request->from, fn ($q, $d) => $q->whereDate('date', '>=', $d))
            ->when($request->to, fn ($q, $d) => $q->whereDate('date', '<=', $d))
            ->when($request->category_id, fn ($q, $id) => $q->where('expense_category_id', $id))
            ->latest()
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        $total = (float) Expense::query()
            ->when($request->from, fn ($q, $d) => $q->whereDate('date', '>=', $d))
            ->when($request->to, fn ($q, $d) => $q->whereDate('date', '<=', $d))
            ->sum('amount');

        return Inertia::render('reports/expenses', [
            'expenses' => $expenses,
            'filters' => $request->only(['from', 'to', 'category_id']),
            'total' => $total,
            'categories' => \App\Models\ExpenseCategory::query()->get(['id', 'name']),
        ]);
    }

    public function customers(Request $request): Response
    {
        $customers = Customer::query()
            ->withCount('sales')
            ->withSum(['sales as total_amount' => fn ($q) => $q->where('status', '!=', 'cancelled')], 'total')
            ->withSum(['sales as total_paid' => fn ($q) => $q->where('status', '!=', 'cancelled')], 'paid')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy('name')
            ->paginate(20);

        return Inertia::render('reports/customers', ['customers' => $customers]);
    }

    public function suppliers(Request $request): Response
    {
        $suppliers = Supplier::query()
            ->withCount('purchases')
            ->withSum(['purchases as total_amount' => fn ($q) => $q->where('status', '!=', 'cancelled')], 'total')
            ->withSum(['purchases as total_paid' => fn ($q) => $q->where('status', '!=', 'cancelled')], 'paid')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy('name')
            ->paginate(20);

        return Inertia::render('reports/suppliers', ['suppliers' => $suppliers]);
    }

    public function products(Request $request): Response
    {
        $products = Product::query()
            ->with('category:id,name', 'brand:id,name')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderByDesc('stock_qty')
            ->paginate(20);

        return Inertia::render('reports/products', ['products' => $products]);
    }

    public function exportPdf(Request $request)
    {
        $from = Carbon::parse($request->date('from') ?? Carbon::now()->startOfMonth());
        $to = Carbon::parse($request->date('to') ?? Carbon::now());

        $reportType = $request->input('type', 'sales');

        $pdf = match ($reportType) {
            'purchases' => $this->purchasesPdf($from, $to),
            'expenses' => $this->expensesPdf($from, $to),
            'profit-loss' => $this->profitLossPdf($from, $to),
            default => $this->salesPdf($from, $to),
        };

        return $pdf->download("{$reportType}-report-{$from->format('Y-m-d')}-to-{$to->format('Y-m-d')}.pdf");
    }

    private function salesPdf(Carbon $from, Carbon $to)
    {
        $sales = Sale::query()
            ->with(['customer:id,name'])
            ->whereBetween('date', [$from, $to])
            ->latest()
            ->get();

        return Pdf::loadView('pdf.report', [
            'title' => 'Sales Report',
            'from' => $from,
            'to' => $to,
            'headers' => ['Invoice', 'Customer', 'Date', 'Total', 'Paid', 'Due', 'Status'],
            'rows' => $sales->map(fn (Sale $s) => [
                $s->invoice_no,
                $s->customer?->name ?? '-',
                $s->date->format('d M Y'),
                number_format((float) $s->total, 2),
                number_format((float) $s->paid, 2),
                number_format((float) $s->due, 2),
                ucfirst($s->payment_status),
            ])->all(),
        ])->setPaper('a4', 'landscape');
    }

    private function purchasesPdf(Carbon $from, Carbon $to)
    {
        $purchases = Purchase::query()
            ->with(['supplier:id,name'])
            ->whereBetween('date', [$from, $to])
            ->latest()
            ->get();

        return Pdf::loadView('pdf.report', [
            'title' => 'Purchase Report',
            'from' => $from,
            'to' => $to,
            'headers' => ['Invoice', 'Supplier', 'Date', 'Total', 'Paid', 'Due', 'Status'],
            'rows' => $purchases->map(fn (Purchase $p) => [
                $p->invoice_no,
                $p->supplier?->name ?? '-',
                $p->date->format('d M Y'),
                number_format((float) $p->total, 2),
                number_format((float) $p->paid, 2),
                number_format((float) $p->due, 2),
                ucfirst($p->payment_status),
            ])->all(),
        ])->setPaper('a4', 'landscape');
    }

    private function expensesPdf(Carbon $from, Carbon $to)
    {
        $expenses = Expense::query()
            ->with('category:id,name')
            ->whereBetween('date', [$from, $to])
            ->latest()
            ->get();

        return Pdf::loadView('pdf.report', [
            'title' => 'Expense Report',
            'from' => $from,
            'to' => $to,
            'headers' => ['Title', 'Category', 'Date', 'Method', 'Amount'],
            'rows' => $expenses->map(fn (Expense $e) => [
                $e->title,
                $e->category?->name ?? '-',
                $e->date->format('d M Y'),
                ucfirst($e->payment_method),
                number_format((float) $e->amount, 2),
            ])->all(),
        ])->setPaper('a4', 'landscape');
    }

    private function profitLossPdf(Carbon $from, Carbon $to)
    {
        $sales = (float) Sale::query()->whereBetween('date', [$from, $to])->where('status', '!=', 'cancelled')->sum('total');
        $expenses = (float) Expense::query()->whereBetween('date', [$from, $to])->sum('amount');

        $cogs = SaleItem::query()
            ->whereHas('sale', fn ($q) => $q->whereBetween('date', [$from, $to])->where('status', '!=', 'cancelled'))
            ->with('product:id,cost_price')
            ->get()
            ->sum(fn ($i) => (float) $i->quantity * (float) $i->product?->cost_price);

        return Pdf::loadView('pdf.report', [
            'title' => 'Profit / Loss Report',
            'from' => $from,
            'to' => $to,
            'headers' => ['Metric', 'Amount'],
            'rows' => [
                ['Total Sales', number_format($sales, 2)],
                ['Cost of Goods Sold', number_format($cogs, 2)],
                ['Gross Profit', number_format($sales - $cogs, 2)],
                ['Total Expenses', number_format($expenses, 2)],
                ['Net Profit', number_format($sales - $cogs - $expenses, 2)],
            ],
        ])->setPaper('a4');
    }

    public function exportCsv(Request $request)
    {
        $type = $request->input('type', 'sales');
        $from = $request->date('from') ? Carbon::parse($request->date('from')) : null;
        $to = $request->date('to') ? Carbon::parse($request->date('to')) : null;

        $filename = "{$type}-report-".now()->format('Y-m-d-His').'.csv';

        return response()->streamDownload(function () use ($type, $from, $to) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");

            match ($type) {
                'purchases' => $this->writePurchasesCsv($out, $from, $to),
                'expenses' => $this->writeExpensesCsv($out, $from, $to),
                'products' => $this->writeProductsCsv($out),
                default => $this->writeSalesCsv($out, $from, $to),
            };

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    private function writeSalesCsv($out, ?Carbon $from, ?Carbon $to): void
    {
        fputcsv($out, ['Invoice', 'Customer', 'Date', 'Subtotal', 'Discount', 'Tax', 'Total', 'Paid', 'Due', 'Status']);

        Sale::query()
            ->with('customer:id,name')
            ->when($from, fn ($q) => $q->whereDate('date', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('date', '<=', $to))
            ->latest()
            ->chunk(500, function ($sales) use ($out) {
                foreach ($sales as $s) {
                    fputcsv($out, [
                        $s->invoice_no, $s->customer?->name ?? '-', $s->date->format('d M Y'),
                        $s->subtotal, $s->discount, $s->tax, $s->total, $s->paid, $s->due, $s->payment_status,
                    ]);
                }
            });
    }

    private function writePurchasesCsv($out, ?Carbon $from, ?Carbon $to): void
    {
        fputcsv($out, ['Invoice', 'Supplier', 'Date', 'Subtotal', 'Discount', 'Tax', 'Total', 'Paid', 'Due', 'Status']);

        Purchase::query()
            ->with('supplier:id,name')
            ->when($from, fn ($q) => $q->whereDate('date', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('date', '<=', $to))
            ->latest()
            ->chunk(500, function ($purchases) use ($out) {
                foreach ($purchases as $p) {
                    fputcsv($out, [
                        $p->invoice_no, $p->supplier?->name ?? '-', $p->date->format('d M Y'),
                        $p->subtotal, $p->discount, $p->tax, $p->total, $p->paid, $p->due, $p->payment_status,
                    ]);
                }
            });
    }

    private function writeExpensesCsv($out, ?Carbon $from, ?Carbon $to): void
    {
        fputcsv($out, ['Title', 'Category', 'Date', 'Method', 'Amount']);

        Expense::query()
            ->with('category:id,name')
            ->when($from, fn ($q) => $q->whereDate('date', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('date', '<=', $to))
            ->latest()
            ->chunk(500, function ($expenses) use ($out) {
                foreach ($expenses as $e) {
                    fputcsv($out, [$e->title, $e->category?->name ?? '-', $e->date->format('d M Y'), $e->payment_method, $e->amount]);
                }
            });
    }

    private function writeProductsCsv($out): void
    {
        fputcsv($out, ['Name', 'SKU', 'Category', 'Stock Qty', 'Min Stock', 'Cost', 'Selling', 'Stock Value']);

        Product::query()
            ->with('category:id,name')
            ->latest()
            ->chunk(500, function ($products) use ($out) {
                foreach ($products as $p) {
                    fputcsv($out, [
                        $p->name, $p->sku, $p->category?->name ?? '-',
                        $p->stock_qty, $p->min_stock, $p->cost_price, $p->selling_price,
                        number_format((float) $p->stock_qty * (float) $p->cost_price, 2),
                    ]);
                }
            });
    }
}
