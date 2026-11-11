<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $totalProducts = Product::query()->count();
        $totalStock = (float) Product::query()->sum('stock_qty');
        $stockValue = (float) Product::query()->sum(\Illuminate\Support\Facades\DB::raw('stock_qty * cost_price'));
        $lowStockCount = Product::query()
            ->whereColumn('stock_qty', '<=', 'min_stock')
            ->where('stock_qty', '>', 0)
            ->count();
        $outOfStockCount = Product::query()->where('stock_qty', '<=', 0)->count();

        $today = Carbon::today();
        $salesToday = (float) Sale::query()->where('date', $today)->where('status', '!=', 'cancelled')->sum('total');
        $salesTotal = (float) Sale::query()->where('status', '!=', 'cancelled')->sum('total');
        $purchasesToday = (float) Purchase::query()->where('date', $today)->where('status', '!=', 'cancelled')->sum('total');
        $purchasesTotal = (float) Purchase::query()->where('status', '!=', 'cancelled')->sum('total');
        $expensesTotal = (float) Expense::query()->sum('amount');

        $costOfGoodsSold = Sale::query()->where('status', '!=', 'cancelled')
            ->with('items.product')
            ->get()
            ->flatMap(fn (Sale $sale) => $sale->items)
            ->sum(fn ($item) => (float) $item->quantity * (float) $item->product?->cost_price);

        $profit = $salesTotal - $costOfGoodsSold;
        $customerDues = (float) Customer::query()->where('balance', '>', 0)->sum('balance');
        $supplierDues = (float) Supplier::query()->where('balance', '>', 0)->sum('balance');

        $recentSales = Sale::query()
            ->with(['customer:id,name', 'user:id,name'])
            ->latest()
            ->limit(5)
            ->get(['id', 'invoice_no', 'customer_id', 'date', 'total', 'paid', 'due', 'payment_status', 'status', 'user_id']);

        $recentPurchases = Purchase::query()
            ->with(['supplier:id,name', 'user:id,name'])
            ->latest()
            ->limit(5)
            ->get(['id', 'invoice_no', 'supplier_id', 'date', 'total', 'paid', 'due', 'payment_status', 'status', 'user_id']);

        $months = collect(range(5, 0))->map(fn (int $i) => Carbon::today()->subMonths($i));

        $salesChart = $months->map(fn (Carbon $m) => [
            'label' => $m->format('M y'),
            'sales' => (float) Sale::query()
                ->whereYear('date', $m->year)
                ->whereMonth('date', $m->month)
                ->where('status', '!=', 'cancelled')
                ->sum('total'),
            'purchases' => (float) Purchase::query()
                ->whereYear('date', $m->year)
                ->whereMonth('date', $m->month)
                ->where('status', '!=', 'cancelled')
                ->sum('total'),
        ]);

        $recentMovements = \App\Models\StockMovement::query()
            ->with('product:id,name,sku,image')
            ->latest()
            ->limit(8)
            ->get();

        $lowStockProducts = Product::query()
            ->whereColumn('stock_qty', '<=', 'min_stock')
            ->with('category:id,name')
            ->latest()
            ->limit(8)
            ->get();

        $unreadNotifications = \App\Models\AppNotification::query()
            ->where(function ($q) use ($user) {
                $q->whereNull('user_id')->orWhere('user_id', $user->id);
            })
            ->where('is_read', false)
            ->count();

        return Inertia::render('dashboard/index', [
            'stats' => [
                'total_products' => $totalProducts,
                'total_stock' => $totalStock,
                'stock_value' => $stockValue,
                'low_stock_count' => $lowStockCount,
                'out_of_stock_count' => $outOfStockCount,
                'sales_today' => $salesToday,
                'sales_total' => $salesTotal,
                'purchases_today' => $purchasesToday,
                'purchases_total' => $purchasesTotal,
                'expenses_total' => $expensesTotal,
                'profit' => $profit,
                'customer_dues' => $customerDues,
                'supplier_dues' => $supplierDues,
            ],
            'charts' => [
                'monthly' => $salesChart,
            ],
            'recent_sales' => $recentSales,
            'recent_purchases' => $recentPurchases,
            'recent_movements' => $recentMovements,
            'low_stock_products' => $lowStockProducts,
            'unread_notifications' => $unreadNotifications,
        ]);
    }
}
