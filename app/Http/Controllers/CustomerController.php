<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Sale;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $customers = Customer::query()
            ->withCount('sales')
            ->withSum(['sales as total_sale_amount' => fn ($q) => $q->where('status', '!=', 'cancelled')], 'total')
            ->when($request->search, fn ($q, $s) => $q->where(fn ($q2) => $q2
                ->where('name', 'like', "%{$s}%")
                ->orWhere('email', 'like', "%{$s}%")
                ->orWhere('phone', 'like', "%{$s}%")))
            ->orderBy('name')
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'filters' => $request->only(['search']),
        ]);
    }

    public function show(Customer $customer): Response
    {
        $sales = Sale::query()
            ->where('customer_id', $customer->id)
            ->with('user:id,name')
            ->latest()
            ->paginate(10);

        return Inertia::render('customers/show', [
            'customer' => $customer,
            'sales' => $sales,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);

        $customer = Customer::query()->create([...$data, 'balance' => $data['opening_balance'] ?? 0]);

        AuditLogger::log('create', $customer, "Created customer {$customer->name}");

        return back()->with('success', 'Customer created successfully.');
    }

    public function update(Request $request, Customer $customer): RedirectResponse
    {
        $data = $this->validateData($request);

        $customer->update($data);

        AuditLogger::log('update', $customer, "Updated customer {$customer->name}");

        return back()->with('success', 'Customer updated successfully.');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        AuditLogger::log('delete', $customer, "Deleted customer {$customer->name}");

        $customer->delete();

        return back()->with('success', 'Customer deleted successfully.');
    }

    /** @return array<string, mixed> */
    private function validateData(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'opening_balance' => ['nullable', 'numeric', 'min:0'],
            'note' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);
    }
}
