<?php

use App\Http\Controllers\BrandController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // Products
    Route::get('products', [ProductController::class, 'index'])
        ->middleware('permission:view products')->name('products.index');
    Route::get('products/create', [ProductController::class, 'create'])
        ->middleware('permission:manage products')->name('products.create');
    Route::post('products', [ProductController::class, 'store'])
        ->middleware('permission:manage products')->name('products.store');
    Route::get('products/{product}/edit', [ProductController::class, 'edit'])
        ->middleware('permission:manage products')->name('products.edit');
    Route::put('products/{product}', [ProductController::class, 'update'])
        ->middleware('permission:manage products')->name('products.update');
    Route::delete('products/{product}', [ProductController::class, 'destroy'])
        ->middleware('permission:manage products')->name('products.destroy');

    // Categories
    Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('categories', [CategoryController::class, 'store'])->middleware('permission:manage categories')->name('categories.store');
    Route::put('categories/{category}', [CategoryController::class, 'update'])->middleware('permission:manage categories')->name('categories.update');
    Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->middleware('permission:manage categories')->name('categories.destroy');

    // Brands
    Route::get('brands', [BrandController::class, 'index'])->name('brands.index');
    Route::post('brands', [BrandController::class, 'store'])->middleware('permission:manage brands')->name('brands.store');
    Route::put('brands/{brand}', [BrandController::class, 'update'])->middleware('permission:manage brands')->name('brands.update');
    Route::delete('brands/{brand}', [BrandController::class, 'destroy'])->middleware('permission:manage brands')->name('brands.destroy');

    // Suppliers
    Route::get('suppliers', [SupplierController::class, 'index'])->name('suppliers.index');
    Route::get('suppliers/{supplier}', [SupplierController::class, 'show'])->name('suppliers.show');
    Route::post('suppliers', [SupplierController::class, 'store'])->middleware('permission:manage suppliers')->name('suppliers.store');
    Route::put('suppliers/{supplier}', [SupplierController::class, 'update'])->middleware('permission:manage suppliers')->name('suppliers.update');
    Route::delete('suppliers/{supplier}', [SupplierController::class, 'destroy'])->middleware('permission:manage suppliers')->name('suppliers.destroy');

    // Customers
    Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::get('customers/{customer}', [CustomerController::class, 'show'])->name('customers.show');
    Route::post('customers', [CustomerController::class, 'store'])->middleware('permission:manage customers')->name('customers.store');
    Route::put('customers/{customer}', [CustomerController::class, 'update'])->middleware('permission:manage customers')->name('customers.update');
    Route::delete('customers/{customer}', [CustomerController::class, 'destroy'])->middleware('permission:manage customers')->name('customers.destroy');

    // Purchases
    Route::get('purchases', [PurchaseController::class, 'index'])->name('purchases.index');
    Route::get('purchases/create', [PurchaseController::class, 'create'])->middleware('permission:manage purchases')->name('purchases.create');
    Route::post('purchases', [PurchaseController::class, 'store'])->middleware('permission:manage purchases')->name('purchases.store');
    Route::get('purchases/{purchase}', [PurchaseController::class, 'show'])->name('purchases.show');
    Route::get('purchases/{purchase}/invoice', [PurchaseController::class, 'invoice'])->name('purchases.invoice');
    Route::put('purchases/{purchase}/status', [PurchaseController::class, 'updateStatus'])->middleware('permission:manage purchases')->name('purchases.status');
    Route::delete('purchases/{purchase}', [PurchaseController::class, 'destroy'])->middleware('permission:manage purchases')->name('purchases.destroy');

    // Sales / POS
    Route::get('sales', [SaleController::class, 'index'])->name('sales.index');
    Route::get('pos', [SaleController::class, 'pos'])->name('sales.pos');
    Route::post('sales', [SaleController::class, 'store'])->name('sales.store');
    Route::get('sales/{sale}', [SaleController::class, 'show'])->name('sales.show');
    Route::get('sales/{sale}/invoice', [SaleController::class, 'invoice'])->name('sales.invoice');
    Route::post('sales/{sale}/return', [SaleController::class, 'return'])->middleware('permission:manage sales')->name('sales.return');
    Route::delete('sales/{sale}', [SaleController::class, 'destroy'])->middleware('permission:manage sales')->name('sales.destroy');

    // Stock
    Route::get('stock', [StockController::class, 'index'])->name('stock.index');
    Route::post('stock/adjust', [StockController::class, 'adjust'])->middleware('permission:manage stock')->name('stock.adjust');
    Route::post('stock/transfer', [StockController::class, 'transfer'])->middleware('permission:manage stock')->name('stock.transfer');
    Route::get('stock/low', [StockController::class, 'lowStock'])->name('stock.low');
    Route::get('stock/report', [StockController::class, 'stockReport'])->name('stock.report');
    Route::get('stock/export', [StockController::class, 'exportCsv'])->name('stock.export');

    // Expenses
    Route::get('expenses', [ExpenseController::class, 'index'])->name('expenses.index');
    Route::post('expenses', [ExpenseController::class, 'store'])->middleware('permission:manage expenses')->name('expenses.store');
    Route::put('expenses/{expense}', [ExpenseController::class, 'update'])->middleware('permission:manage expenses')->name('expenses.update');
    Route::delete('expenses/{expense}', [ExpenseController::class, 'destroy'])->middleware('permission:manage expenses')->name('expenses.destroy');
    Route::post('expense-categories', [ExpenseController::class, 'storeCategory'])->middleware('permission:manage expenses')->name('expense-categories.store');

    // Payments
    Route::get('payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::get('payments/due', [PaymentController::class, 'dueList'])->name('payments.due');
    Route::post('payments/receive', [PaymentController::class, 'receive'])->middleware('permission:manage payments')->name('payments.receive');
    Route::post('payments/pay', [PaymentController::class, 'pay'])->middleware('permission:manage payments')->name('payments.pay');
    Route::post('sales/{sale}/payments', [PaymentController::class, 'settleSale'])->middleware('permission:manage payments')->name('payments.settle-sale');
    Route::post('purchases/{purchase}/payments', [PaymentController::class, 'settlePurchase'])->middleware('permission:manage payments')->name('payments.settle-purchase');

    // Reports
    Route::get('reports', [ReportController::class, 'index'])->middleware('permission:view reports')->name('reports.index');
    Route::get('reports/sales', [ReportController::class, 'sales'])->middleware('permission:view reports')->name('reports.sales');
    Route::get('reports/purchases', [ReportController::class, 'purchases'])->middleware('permission:view reports')->name('reports.purchases');
    Route::get('reports/profit-loss', [ReportController::class, 'profitLoss'])->middleware('permission:view reports')->name('reports.profit-loss');
    Route::get('reports/expenses', [ReportController::class, 'expenses'])->middleware('permission:view reports')->name('reports.expenses');
    Route::get('reports/customers', [ReportController::class, 'customers'])->middleware('permission:view reports')->name('reports.customers');
    Route::get('reports/suppliers', [ReportController::class, 'suppliers'])->middleware('permission:view reports')->name('reports.suppliers');
    Route::get('reports/products', [ReportController::class, 'products'])->middleware('permission:view reports')->name('reports.products');
    Route::get('reports/export-pdf', [ReportController::class, 'exportPdf'])->middleware('permission:view reports')->name('reports.export-pdf');
    Route::get('reports/export-csv', [ReportController::class, 'exportCsv'])->middleware('permission:view reports')->name('reports.export-csv');

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount'])->name('notifications.unread-count');
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');

    // Users
    Route::get('users', [UserController::class, 'index'])->middleware('permission:manage users')->name('users.index');
    Route::post('users', [UserController::class, 'store'])->middleware('permission:manage users')->name('users.store');
    Route::put('users/{user}', [UserController::class, 'update'])->middleware('permission:manage users')->name('users.update');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->middleware('permission:manage users')->name('users.destroy');
});

require __DIR__.'/settings.php';
