<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\Supplier;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function index(Request $request): Response
    {
        $suppliers = Supplier::query()
            ->withCount('purchases')
            ->withSum(['purchases as total_purchase_amount' => fn ($q) => $q->where('status', '!=', 'cancelled')], 'total')
            ->when($request->search, fn ($q, $s) => $q->where(fn ($q2) => $q2
                ->where('name', 'like', "%{$s}%")
                ->orWhere('company', 'like', "%{$s}%")
                ->orWhere('email', 'like', "%{$s}%")
                ->orWhere('phone', 'like', "%{$s}%")
                ->orWhere('mobile', 'like', "%{$s}%")))
            ->orderBy('name')
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        return Inertia::render('suppliers/index', [
            'suppliers' => $suppliers,
            'filters' => $request->only(['search']),
        ]);
    }

    public function show(Supplier $supplier): Response
    {
        $purchases = Purchase::query()
            ->where('supplier_id', $supplier->id)
            ->with('user:id,name')
            ->latest()
            ->paginate(10);

        return Inertia::render('suppliers/show', [
            'supplier' => $supplier,
            'purchases' => $purchases,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);

        $supplier = Supplier::query()->create([...$data, 'balance' => $data['opening_balance'] ?? 0]);

        AuditLogger::log('create', $supplier, "Created supplier {$supplier->name}");

        return back()->with('success', 'Supplier created successfully.');
    }

    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        $data = $this->validateData($request);

        $supplier->update($data);

        AuditLogger::log('update', $supplier, "Updated supplier {$supplier->name}");

        return back()->with('success', 'Supplier updated successfully.');
    }

    public function destroy(Supplier $supplier): RedirectResponse
    {
        AuditLogger::log('delete', $supplier, "Deleted supplier {$supplier->name}");

        $supplier->delete();

        return back()->with('success', 'Supplier deleted successfully.');
    }

    /** @return array<string, mixed> */
    private function validateData(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'mobile' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'tax_id' => ['nullable', 'string', 'max:100'],
            'opening_balance' => ['nullable', 'numeric', 'min:0'],
            'note' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);
    }
}
