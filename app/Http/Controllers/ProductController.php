<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $products = Product::query()
            ->with(['brand:id,name', 'category:id,name'])
            ->when($request->search, fn ($q, $s) => $q->where(fn ($q2) => $q2
                ->where('name', 'like', "%{$s}%")
                ->orWhere('sku', 'like', "%{$s}%")
                ->orWhere('barcode', 'like', "%{$s}%")))
            ->when($request->category_id, fn ($q, $id) => $q->where('category_id', $id))
            ->when($request->brand_id, fn ($q, $id) => $q->where('brand_id', $id))
            ->when($request->status === 'low', fn ($q) => $q->whereColumn('stock_qty', '<=', 'min_stock')->where('stock_qty', '>', 0))
            ->when($request->status === 'out', fn ($q) => $q->where('stock_qty', '<=', 0))
            ->when($request->status === 'active', fn ($q) => $q->where('is_active', true))
            ->when($request->status === 'inactive', fn ($q) => $q->where('is_active', false))
            ->latest()
            ->paginate($request->integer('per_page', 12))
            ->withQueryString();

        return Inertia::render('products/index', [
            'products' => $products,
            'filters' => $request->only(['search', 'category_id', 'brand_id', 'status']),
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'brands' => Brand::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('products/create', [
            'categories' => $this->categoryTree(),
            'brands' => Brand::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);

        $product = Product::query()->create($data);

        AuditLogger::log('create', $product, "Created product {$product->name}");

        return redirect()
            ->route('products.index')
            ->with('success', 'Product created successfully.');
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('products/edit', [
            'product' => $product->load(['brand:id,name', 'category:id,name']),
            'categories' => $this->categoryTree(),
            'brands' => Brand::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $data = $this->validateData($request, $product);

        $product->update($data);

        AuditLogger::log('update', $product, "Updated product {$product->name}");

        return redirect()
            ->route('products.index')
            ->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        AuditLogger::log('delete', $product, "Deleted product {$product->name}");

        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return back()->with('success', 'Product deleted successfully.');
    }

    /** @return array<string, mixed> */
    private function validateData(Request $request, ?Product $product = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:255', 'unique:products,sku,'.($product?->id ?? 'NULL')],
            'barcode' => ['nullable', 'string', 'max:255', 'unique:products,barcode,'.($product?->id ?? 'NULL')],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'discount_price' => ['nullable', 'numeric', 'min:0'],
            'min_stock' => ['required', 'numeric', 'min:0'],
            'purchase_limit' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
            'description' => ['nullable', 'string'],
        ]);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
            if ($product?->image) {
                Storage::disk('public')->delete($product->image);
            }
        }

        $data['sku'] = strtoupper(Str::slug($data['sku'], ''));

        return $data;
    }

    /** @return array<int, array{id: int, name: string, children: array}> */
    private function categoryTree(): array
    {
        return Category::query()
            ->with('children:id,parent_id,name')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Category $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'children' => $c->children->map(fn (Category $child) => ['id' => $child->id, 'name' => $child->name]),
            ])
            ->all();
    }
}
