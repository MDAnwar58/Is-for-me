<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\Supplier;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $payments = Payment::query()
            ->with(['payable', 'user:id,name'])
            ->when($request->type, fn ($q, $t) => $q->where('payable_type', $t === 'sale' ? Sale::class : Purchase::class))
            ->when($request->from, fn ($q, $d) => $q->whereDate('date', '>=', $d))
            ->when($request->to, fn ($q, $d) => $q->whereDate('date', '<=', $d))
            ->latest()
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        $totalReceived = (float) Payment::query()->where('payable_type', Sale::class)->sum('amount');
        $totalPaid = (float) Payment::query()->where('payable_type', Purchase::class)->sum('amount');

        return Inertia::render('payments/index', [
            'payments' => $payments,
            'filters' => $request->only(['type', 'from', 'to']),
            'total_received' => $totalReceived,
            'total_paid' => $totalPaid,
        ]);
    }

    public function dueList(): Response
    {
        $customerDues = Customer::query()
            ->where('balance', '>', 0)
            ->withCount('sales')
            ->orderByDesc('balance')
            ->get();

        $supplierDues = Supplier::query()
            ->where('balance', '>', 0)
            ->withCount('purchases')
            ->orderByDesc('balance')
            ->get();

        return Inertia::render('payments/due', [
            'customer_dues' => $customerDues,
            'supplier_dues' => $supplierDues,
        ]);
    }

    public function receive(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'customer_id' => ['required', 'exists:customers,id'],
            'date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'reference' => ['nullable', 'string', 'max:100'],
            'note' => ['nullable', 'string'],
        ]);

        $customer = Customer::query()->findOrFail($data['customer_id']);

        $payment = Payment::query()->create([
            'payable_type' => Customer::class,
            'payable_id' => $customer->id,
            'date' => $data['date'],
            'amount' => $data['amount'],
            'payment_method' => $data['payment_method'] ?? 'cash',
            'reference' => $data['reference'] ?? null,
            'note' => $data['note'] ?? null,
            'user_id' => auth()->id(),
        ]);

        $customer->decrement('balance', $data['amount']);

        AuditLogger::log('create', $payment, "Received {$data['amount']} from customer {$customer->name}");

        return back()->with('success', 'Payment received.');
    }

    public function pay(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'reference' => ['nullable', 'string', 'max:100'],
            'note' => ['nullable', 'string'],
        ]);

        $supplier = Supplier::query()->findOrFail($data['supplier_id']);

        $payment = Payment::query()->create([
            'payable_type' => Supplier::class,
            'payable_id' => $supplier->id,
            'date' => $data['date'],
            'amount' => $data['amount'],
            'payment_method' => $data['payment_method'] ?? 'cash',
            'reference' => $data['reference'] ?? null,
            'note' => $data['note'] ?? null,
            'user_id' => auth()->id(),
        ]);

        $supplier->decrement('balance', $data['amount']);

        AuditLogger::log('create', $payment, "Paid {$data['amount']} to supplier {$supplier->name}");

        return back()->with('success', 'Payment made.');
    }

    public function settleSale(Request $request, Sale $sale): RedirectResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01', 'max:'.$sale->due],
            'date' => ['required', 'date'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'reference' => ['nullable', 'string', 'max:100'],
            'note' => ['nullable', 'string'],
        ]);

        $sale->payments()->create([
            'date' => $data['date'],
            'amount' => $data['amount'],
            'payment_method' => $data['payment_method'] ?? 'cash',
            'reference' => $data['reference'] ?? null,
            'note' => $data['note'] ?? null,
            'user_id' => auth()->id(),
        ]);

        $sale->update([
            'paid' => $sale->paid + $data['amount'],
            'due' => max(0, $sale->due - $data['amount']),
            'payment_status' => PaymentStatus::fromAmounts($sale->total, $sale->paid + $data['amount'])->value,
        ]);

        if ($sale->customer_id) {
            $sale->customer->decrement('balance', $data['amount']);
        }

        AuditLogger::log('create', $sale, "Payment received on sale {$sale->invoice_no}");

        return back()->with('success', 'Payment received.');
    }

    public function settlePurchase(Request $request, Purchase $purchase): RedirectResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01', 'max:'.$purchase->due],
            'date' => ['required', 'date'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'reference' => ['nullable', 'string', 'max:100'],
            'note' => ['nullable', 'string'],
        ]);

        $purchase->payments()->create([
            'date' => $data['date'],
            'amount' => $data['amount'],
            'payment_method' => $data['payment_method'] ?? 'cash',
            'reference' => $data['reference'] ?? null,
            'note' => $data['note'] ?? null,
            'user_id' => auth()->id(),
        ]);

        $purchase->update([
            'paid' => $purchase->paid + $data['amount'],
            'due' => max(0, $purchase->due - $data['amount']),
            'payment_status' => PaymentStatus::fromAmounts($purchase->total, $purchase->paid + $data['amount'])->value,
        ]);

        if ($purchase->supplier_id) {
            $purchase->supplier->decrement('balance', $data['amount']);
        }

        AuditLogger::log('create', $purchase, "Payment made on purchase {$purchase->invoice_no}");

        return back()->with('success', 'Payment made.');
    }
}
