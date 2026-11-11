<?php

namespace Database\Seeders;

use App\Enums\PaymentStatus;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Supplier;
use App\Services\InvoiceService;
use App\Services\StockService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DemoDataSeeder extends Seeder
{
    public function __construct(private readonly StockService $stockService) {}

    public function run(): void
    {
        $categories = [
            ['name' => 'Electronics', 'color' => '#6366f1', 'children' => ['Mobile Phones', 'Laptops', 'Accessories']],
            ['name' => 'Groceries', 'color' => '#10b981', 'children' => ['Beverages', 'Snacks', 'Household']],
            ['name' => 'Clothing', 'color' => '#f43f5e', 'children' => ['Men', 'Women', 'Kids']],
        ];

        foreach ($categories as $category) {
            $parent = Category::query()->create([
                'name' => $category['name'],
                'slug' => \Illuminate\Support\Str::slug($category['name']),
                'color' => $category['color'],
            ]);
            foreach ($category['children'] as $child) {
                Category::query()->create([
                    'name' => $child,
                    'slug' => \Illuminate\Support\Str::slug($child),
                    'parent_id' => $parent->id,
                    'color' => $category['color'],
                ]);
            }
        }

        $brandNames = ['Samsung', 'Apple', 'HP', 'Dell', 'Unilever', 'Nestle', 'Levi\'s', 'Zara'];
        $brands = collect($brandNames)->map(fn (string $name) => Brand::query()->create(['name' => $name]));

        $categories = Category::query()->whereNotNull('parent_id')->get();

        $productData = [
            ['name' => 'Samsung Galaxy S24', 'cost' => 55000, 'price' => 62000, 'min' => 5],
            ['name' => 'iPhone 15 Pro', 'cost' => 115000, 'price' => 124000, 'min' => 3],
            ['name' => 'HP Pavilion Laptop', 'cost' => 78000, 'price' => 85000, 'min' => 4],
            ['name' => 'Dell XPS 13', 'cost' => 145000, 'price' => 155000, 'min' => 2],
            ['name' => 'Wireless Earbuds', 'cost' => 1800, 'price' => 2500, 'min' => 15],
            ['name' => 'USB-C Cable', 'cost' => 250, 'price' => 450, 'min' => 20],
            ['name' => 'Coca Cola 500ml', 'cost' => 55, 'price' => 70, 'min' => 50],
            ['name' => 'Mineral Water 1L', 'cost' => 20, 'price' => 30, 'min' => 100],
            ['name' => 'Lays Chips Family Pack', 'cost' => 90, 'price' => 120, 'min' => 40],
            ['name' => 'Dishwashing Liquid', 'cost' => 130, 'price' => 165, 'min' => 30],
            ['name' => 'Denim Jeans', 'cost' => 1400, 'price' => 1900, 'min' => 10],
            ['name' => 'Cotton T-Shirt', 'cost' => 450, 'price' => 700, 'min' => 20],
            ['name' => 'Kids Sneakers', 'cost' => 850, 'price' => 1200, 'min' => 12],
        ];

        $products = [];
        foreach ($productData as $index => $data) {
            $category = $categories->get($index % $categories->count());
            $products[] = Product::query()->create([
                'name' => $data['name'],
                'sku' => 'SKU-'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT),
                'barcode' => '8'.str_pad((string) (10000000000 + $index), 12, '0', STR_PAD_LEFT),
                'brand_id' => $brands->get($index % $brands->count())->id,
                'category_id' => $category->id,
                'cost_price' => $data['cost'],
                'selling_price' => $data['price'],
                'discount_price' => $index % 4 === 0 ? $data['price'] - 500 : null,
                'stock_qty' => 0,
                'min_stock' => $data['min'],
                'description' => "High quality {$data['name']} for retail.",
            ]);
        }

        $suppliers = [
            ['name' => 'TechSource Ltd.', 'company' => 'TechSource Ltd.', 'phone' => '+8801712345678', 'city' => 'Dhaka'],
            ['name' => 'Global Imports Co.', 'company' => 'Global Imports Co.', 'phone' => '+8801812345678', 'city' => 'Chattogram'],
            ['name' => 'FreshMart Distribution', 'company' => 'FreshMart Distribution', 'phone' => '+8801912345678', 'city' => 'Khulna'],
            ['name' => 'Fashion Wholesale BD', 'company' => 'Fashion Wholesale BD', 'phone' => '+8801612345678', 'city' => 'Dhaka'],
        ];
        foreach ($suppliers as $supplier) {
            Supplier::query()->create($supplier);
        }

        $customers = [
            ['name' => 'Walk-in Customer', 'phone' => null],
            ['name' => 'Rahim Ahmed', 'phone' => '+8801711111111', 'city' => 'Dhaka'],
            ['name' => 'Karim Uddin', 'phone' => '+8801811111111', 'city' => 'Dhaka'],
            ['name' => 'Fatima Begum', 'phone' => '+8801911111111', 'city' => 'Chattogram'],
            ['name' => 'Shakil Rahman', 'phone' => '+8801611111111', 'city' => 'Sylhet'],
        ];
        foreach ($customers as $customer) {
            Customer::query()->create($customer);
        }

        $suppliers = Supplier::query()->get();

        foreach ([1, 2, 3] as $month) {
            foreach ($suppliers as $i => $supplier) {
                $date = Carbon::now()->subMonths(3 - $month)->addDays($i * 3);
                $items = collect(range(0, 2))->map(function () use (&$products) {
                    $product = $products[array_rand($products)];
                    $qty = rand(10, 40);

                    return [$product, $qty];
                });

                $subtotal = collect($items)->sum(fn (array $pair) => $pair[1] * $pair[0]->cost_price);
                $total = $subtotal;
                $paid = rand(0, 2) === 0 ? round($total / 2) : $total;

                $purchase = Purchase::query()->create([
                    'invoice_no' => InvoiceService::purchaseInvoiceNo(),
                    'supplier_id' => $supplier->id,
                    'date' => $date->format('Y-m-d'),
                    'subtotal' => $subtotal,
                    'discount' => 0,
                    'tax' => 0,
                    'total' => $total,
                    'paid' => $paid,
                    'due' => $total - $paid,
                    'payment_status' => PaymentStatus::fromAmounts($total, $paid)->value,
                    'payment_method' => 'cash',
                    'status' => 'received',
                    'user_id' => 1,
                ]);

                foreach ($items as [$product, $qty]) {
                    PurchaseItem::query()->create([
                        'purchase_id' => $purchase->id,
                        'product_id' => $product->id,
                        'quantity' => $qty,
                        'unit_cost' => $product->cost_price,
                        'total' => $qty * $product->cost_price,
                    ]);
                    $this->stockService->increase(
                        \App\Enums\StockMovementType::Purchase,
                        $product->id,
                        $qty,
                        Purchase::class,
                        $purchase->id,
                        "Purchase {$purchase->invoice_no}",
                    );
                }

                if ($paid > 0) {
                    $purchase->payments()->create([
                        'date' => $date,
                        'amount' => $paid,
                        'payment_method' => 'cash',
                        'user_id' => 1,
                    ]);
                }

                if ($purchase->due > 0) {
                    $supplier->increment('balance', $purchase->due);
                }
            }
        }

        $customers = Customer::query()->get();

        foreach ([1, 2, 3] as $month) {
            foreach (range(0, 14) as $i) {
                $date = Carbon::now()->subMonths(3 - $month)->addDays($i);
                $customer = $customers->get(rand(0, $customers->count() - 1));
                $items = collect(range(0, rand(1, 3)))->map(function () use (&$products) {
                    $product = $products[array_rand($products)];
                    $qty = rand(1, 5);

                    return [$product, $qty];
                })->filter(fn (array $pair) => (float) $pair[0]->fresh()->stock_qty >= $pair[1])->values();

                if ($items->isEmpty()) {
                    continue;
                }

                $subtotal = collect($items)->sum(fn (array $pair) => $pair[1] * $pair[0]->selling_price);
                $discount = rand(0, 3) === 0 ? rand(50, 300) : 0;
                $tax = round($subtotal * 0.05);
                $total = $subtotal - $discount + $tax;
                $paid = rand(0, 3) === 0 ? round($total / 2) : $total;

                $sale = Sale::query()->create([
                    'invoice_no' => InvoiceService::saleInvoiceNo(),
                    'customer_id' => $customer->id,
                    'date' => $date->format('Y-m-d'),
                    'subtotal' => $subtotal,
                    'discount' => $discount,
                    'tax' => $tax,
                    'total' => $total,
                    'paid' => $paid,
                    'due' => $total - $paid,
                    'payment_status' => PaymentStatus::fromAmounts($total, $paid)->value,
                    'payment_method' => 'cash',
                    'status' => 'completed',
                    'user_id' => 1,
                ]);

                foreach ($items as [$product, $qty]) {
                    SaleItem::query()->create([
                        'sale_id' => $sale->id,
                        'product_id' => $product->id,
                        'quantity' => $qty,
                        'unit_price' => $product->selling_price,
                        'discount' => 0,
                        'total' => $qty * $product->selling_price,
                    ]);
                    $this->stockService->decrease(
                        \App\Enums\StockMovementType::Sale,
                        $product->id,
                        $qty,
                        Sale::class,
                        $sale->id,
                        "Sale {$sale->invoice_no}",
                    );
                }

                if ($paid > 0) {
                    $sale->payments()->create([
                        'date' => $date,
                        'amount' => $paid,
                        'payment_method' => 'cash',
                        'user_id' => 1,
                    ]);
                }

                if ($sale->due > 0) {
                    $customer->increment('balance', $sale->due);
                }
            }
        }

        $expenseCategories = ['Rent', 'Utilities', 'Salaries', 'Transport', 'Marketing'];
        foreach ($expenseCategories as $name) {
            ExpenseCategory::query()->create(['name' => $name]);
        }

        $expenseCategories = ExpenseCategory::query()->get();

        foreach (range(0, 25) as $i) {
            Expense::query()->create([
                'expense_category_id' => $expenseCategories->get($i % $expenseCategories->count())->id,
                'title' => ['Office rent', 'Electricity bill', 'Internet bill', 'Staff salary', 'Delivery cost', 'Social media ads'][$i % 6],
                'date' => Carbon::now()->subDays($i * 3)->format('Y-m-d'),
                'amount' => rand(500, 25000),
                'payment_method' => ['cash', 'bank', 'mobile'][$i % 3],
                'user_id' => 1,
            ]);
        }
    }
}
