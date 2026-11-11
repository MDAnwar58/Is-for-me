<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function index(Request $request): Response
    {
        $expenses = Expense::query()
            ->with(['category:id,name', 'user:id,name'])
            ->when($request->search, fn ($q, $s) => $q->where('title', 'like', "%{$s}%"))
            ->when($request->category_id, fn ($q, $id) => $q->where('expense_category_id', $id))
            ->when($request->from, fn ($q, $d) => $q->whereDate('date', '>=', $d))
            ->when($request->to, fn ($q, $d) => $q->whereDate('date', '<=', $d))
            ->latest()
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        $totalThisMonth = (float) Expense::query()
            ->whereBetween('date', [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()])
            ->sum('amount');

        $categories = ExpenseCategory::query()
            ->withCount('expenses')
            ->withSum('expenses', 'amount')
            ->orderBy('name')
            ->get();

        return Inertia::render('expenses/index', [
            'expenses' => $expenses,
            'filters' => $request->only(['search', 'category_id', 'from', 'to']),
            'categories' => $categories,
            'total_this_month' => $totalThisMonth,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'expense_category_id' => ['nullable', 'exists:expense_categories,id'],
            'date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'reference' => ['nullable', 'string', 'max:100'],
        ]);

        $expense = Expense::query()->create([...$data, 'user_id' => auth()->id()]);

        AuditLogger::log('create', $expense, "Recorded expense {$expense->title}");

        return back()->with('success', 'Expense recorded successfully.');
    }

    public function update(Request $request, Expense $expense): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'expense_category_id' => ['nullable', 'exists:expense_categories,id'],
            'date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'reference' => ['nullable', 'string', 'max:100'],
        ]);

        $expense->update($data);

        AuditLogger::log('update', $expense, "Updated expense {$expense->title}");

        return back()->with('success', 'Expense updated successfully.');
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        AuditLogger::log('delete', $expense, "Deleted expense {$expense->title}");

        $expense->delete();

        return back()->with('success', 'Expense deleted successfully.');
    }

    public function storeCategory(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:expense_categories,name'],
            'description' => ['nullable', 'string'],
        ]);

        ExpenseCategory::query()->create($data);

        return back()->with('success', 'Expense category created.');
    }
}
