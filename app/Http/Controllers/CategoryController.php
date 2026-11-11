<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $categories = Category::query()
            ->withCount(['products', 'children'])
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy('name')
            ->get();

        $tree = $this->tree();

        return Inertia::render('categories/index', [
            'categories' => $categories,
            'tree' => $tree,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'exists:categories,id'],
            'color' => ['nullable', 'string', 'max:32'],
            'icon' => ['nullable', 'string', 'max:64'],
            'description' => ['nullable', 'string'],
        ]);
        $data['slug'] = Str::slug($data['name']);

        $category = Category::query()->create($data);

        AuditLogger::log('create', $category, "Created category {$category->name}");

        return back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'exists:categories,id', 'not_in:'.$category->id],
            'color' => ['nullable', 'string', 'max:32'],
            'icon' => ['nullable', 'string', 'max:64'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);
        $data['slug'] = Str::slug($data['name']);

        $category->update($data);

        AuditLogger::log('update', $category, "Updated category {$category->name}");

        return back()->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        AuditLogger::log('delete', $category, "Deleted category {$category->name}");

        $category->delete();

        return back()->with('success', 'Category deleted successfully.');
    }

    /** @return array<int, array{id: int, name: string, children: array}> */
    private function tree(): array
    {
        return Category::query()
            ->with('children:id,parent_id,name')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Category $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'children' => $c->children->map(fn (Category $child) => [
                    'id' => $child->id,
                    'name' => $child->name,
                ]),
            ])
            ->all();
    }
}
