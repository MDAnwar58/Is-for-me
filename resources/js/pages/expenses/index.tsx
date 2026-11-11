import { Head, router, useForm } from '@inertiajs/react';
import { CalendarDays, FolderPlus, Pencil, Plus, ReceiptText, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Page } from '@/components/page';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/format';
import { usePermissions } from '@/lib/permissions';
import type { Expense, ExpenseCategory, Paginated } from '@/types/inventory';

type Props = {
    expenses: Paginated<Expense>;
    filters: { search?: string; category_id?: string; from?: string; to?: string };
    categories: (ExpenseCategory & { expenses_count?: number; expenses_sum_amount?: string | number })[];
    total_this_month: number;
};

export default function ExpensesIndex({ expenses, categories, total_this_month }: Props) {
    const { can } = usePermissions();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Expense | null>(null);
    const [catOpen, setCatOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const form = useForm({
        title: '',
        description: '',
        expense_category_id: '',
        date: new Date().toISOString().slice(0, 10),
        amount: '',
        payment_method: 'cash',
        reference: '',
    });

    const catForm = useForm({ name: '', description: '' });

    const openCreate = () => {
        setEditing(null);
        form.reset();
        setOpen(true);
    };

    const openEdit = (expense: Expense) => {
        setEditing(expense);
        form.setData({
            title: expense.title,
            description: expense.description ?? '',
            expense_category_id: expense.expense_category_id ? String(expense.expense_category_id) : '',
            date: expense.date.slice(0, 10),
            amount: String(expense.amount),
            payment_method: expense.payment_method,
            reference: expense.reference ?? '',
        });
        setOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editing) {
            form.put(`/expenses/${editing.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    setEditing(null);
                },
            });
        } else {
            form.post('/expenses', {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    form.reset();
                },
            });
        }
    };

    const submitCategory = (e: React.FormEvent) => {
        e.preventDefault();
        catForm.post('/expense-categories', {
            preserveScroll: true,
            onSuccess: () => {
                setCatOpen(false);
                catForm.reset();
            },
        });
    };

    const confirmDelete = () => {
        if (deleteId === null) {
return;
}

        router.delete(`/expenses/${deleteId}`, { preserveScroll: true, onSuccess: () => setDeleteId(null) });
    };

    return (
        <Page
            title="Expenses"
            description="Track operational and overhead costs"
            breadcrumbs={[{ title: 'Expenses', href: '/expenses' }]}
            actions={
                can('manage expenses') ? (
                    <Button className="cursor-pointer" onClick={openCreate}>
                        <Plus className="size-4" />
                        Add Expense
                    </Button>
                ) : undefined
            }
        >
            <Head title="Expenses" />

            <div className="grid gap-4 sm:grid-cols-4">
                <Card className="shadow-3d">
                    <CardContent className="flex items-center gap-3 pt-5">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                            <CalendarDays className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">This Month</p>
                            <p className="text-lg font-bold">{formatCurrency(total_this_month)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-3d">
                    <CardContent className="flex items-center gap-3 pt-5">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                            <ReceiptText className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Records</p>
                            <p className="text-lg font-bold">{expenses.total}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                <div className="overflow-x-auto rounded-2xl border bg-card shadow-3d">
                    <table className="w-full min-w-[640px] text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                                <th className="px-4 py-3">Method</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {expenses.data.map((expense) => (
                                <tr key={expense.id} className="transition-colors hover:bg-accent/50">
                                    <td className="px-4 py-3">
                                        <p className="font-medium">{expense.title}</p>
                                        {expense.description && (
                                            <p className="max-w-56 truncate text-xs text-muted-foreground">{expense.description}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{expense.category?.name ?? '—'}</td>
                                    <td className="px-4 py-3">{formatDate(expense.date)}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-rose-600 dark:text-rose-400">
                                        {formatCurrency(expense.amount)}
                                    </td>
                                    <td className="px-4 py-3 capitalize text-muted-foreground">{expense.payment_method}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            {can('manage expenses') && (
                                                <>
                                                    <Button variant="ghost" size="sm" className="cursor-pointer" onClick={() => openEdit(expense)}>
                                                        <Pencil className="size-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="cursor-pointer text-rose-500" onClick={() => setDeleteId(expense.id)}>
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {expenses.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                                        No expenses recorded
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="space-y-4">
                    <Card className="shadow-3d">
                        <CardContent className="pt-5">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="font-semibold">Categories</h3>
                                {can('manage expenses') && (
                                    <Button variant="ghost" size="sm" className="cursor-pointer" onClick={() => setCatOpen(true)}>
                                        <FolderPlus className="size-4" />
                                        New
                                    </Button>
                                )}
                            </div>
                            <div className="space-y-2">
                                {categories.map((category) => (
                                    <div key={category.id} className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                                        <span className="text-sm font-medium">{category.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatCurrency(Number(category.expenses_sum_amount ?? 0))}
                                        </span>
                                    </div>
                                ))}
                                {categories.length === 0 && <p className="text-sm text-muted-foreground">No categories yet.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Pagination pagination={expenses} />

            {/* Expense form */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
                        <DialogDescription>Record an expense for your business.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} required />
                        </div>
                        <div>
                            <Label htmlFor="desc">Description</Label>
                            <Input id="desc" value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Category</Label>
                                <Select value={form.data.expense_category_id} onValueChange={(v) => form.setData('expense_category_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={String(category.id)}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="amount">Amount</Label>
                                <Input id="amount" type="number" min="0.01" step="0.01" value={form.data.amount} onChange={(e) => form.setData('amount', e.target.value)} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" value={form.data.date} onChange={(e) => form.setData('date', e.target.value)} required />
                            </div>
                            <div>
                                <Label>Method</Label>
                                <Select value={form.data.payment_method} onValueChange={(v) => form.setData('payment_method', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="reference">Reference</Label>
                            <Input id="reference" value={form.data.reference} onChange={(e) => form.setData('reference', e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Saving...' : editing ? 'Update Expense' : 'Save Expense'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Category form */}
            <Dialog open={catOpen} onOpenChange={setCatOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Category</DialogTitle>
                        <DialogDescription>Group expenses into categories for better reporting.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCategory} className="space-y-4">
                        <div>
                            <Label htmlFor="cat-name">Name</Label>
                            <Input id="cat-name" value={catForm.data.name} onChange={(e) => catForm.setData('name', e.target.value)} required />
                        </div>
                        <div>
                            <Label htmlFor="cat-desc">Description</Label>
                            <Input id="cat-desc" value={catForm.data.description} onChange={(e) => catForm.setData('description', e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCatOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={catForm.processing}>
                                {catForm.processing ? 'Saving...' : 'Create Category'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete confirm */}
            <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Expense?</DialogTitle>
                        <DialogDescription>This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Page>
    );
}
