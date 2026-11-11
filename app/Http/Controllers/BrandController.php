<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    public function index(Request $request): Response
    {
        $brands = Brand::query()
            ->withCount('products')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy('name')
            ->get();

        return Inertia::render('brands/index', [
            'brands' => $brands,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);
        $data['slug'] = Str::slug($data['name']);

        $brand = Brand::query()->create($data);

        AuditLogger::log('create', $brand, "Created brand {$brand->name}");

        return back()->with('success', 'Brand created successfully.');
    }

    public function update(Request $request, Brand $brand): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);
        $data['slug'] = Str::slug($data['name']);

        $brand->update($data);

        AuditLogger::log('update', $brand, "Updated brand {$brand->name}");

        return back()->with('success', 'Brand updated successfully.');
    }

    public function destroy(Brand $brand): RedirectResponse
    {
        AuditLogger::log('delete', $brand, "Deleted brand {$brand->name}");

        $brand->delete();

        return back()->with('success', 'Brand deleted successfully.');
    }
}
