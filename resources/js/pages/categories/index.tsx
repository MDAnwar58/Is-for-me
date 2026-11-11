import { Head, useForm } from '@inertiajs/react';
import { FolderTree, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Page } from '@/components/page';
import { SearchInput } from '@/components/search-input';
import { Button } from '@/components/ui/button';
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
import { usePermissions } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/inventory';

type TreeItem = {
    id: number;
    name: string;
    children: { id: number; name: string }[];
};

type Props = {
    categories: (Category & { products_count: number; children_count: number })[];
    tree: TreeItem[];
    filters: { search?: string };
};

export default function CategoriesIndex({ categories, tree }: Props) {
    const { can } = usePermissions();
    const canManage = can('manage categories');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        parent_id: '',
        color: '',
        description: '',
        is_active: true,
    });

    const openCreate = () => {
        setEditing(null);
        reset();
        setDialogOpen(true);
    };

    const openEdit = (category: Category) => {
        setEditing(category);
        setData({
            name: category.name,
            parent_id: category.parent_id ? String(category.parent_id) : '',
            color: category.color ?? '',
            description: category.description ?? '',
            is_active: category.is_active,
        });
        setDialogOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editing) {
            put(`/categories/${editing.id}`, { preserveScroll: true, onSuccess: () => setDialogOpen(false) });
        } else {
            post('/categories', { preserveScroll: true, onSuccess: () => setDialogOpen(false) });
        }
    };

    const categoriesById = new Map(categories.map((c) => [c.id, c]));

    return (
        <Page
            title="Categories"
            description="Organize products into categories and subcategories"
            breadcrumbs={[{ title: 'Categories', href: '/categories' }]}
            actions={
                canManage ? (
                    <Button onClick={openCreate} className="cursor-pointer rounded-full shadow-3d">
                        <Plus className="size-4" />
                        New Category
                    </Button>
                ) : undefined
            }
        >
            <Head title="Categories" />

            <SearchInput placeholder="Search categories..." />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {tree.map((parent, index) => {
                    const parentData = categoriesById.get(parent.id);

                    return (
                        <div
                            key={parent.id}
                            className="tilt-card overflow-hidden rounded-2xl border bg-card shadow-3d animate-fade-up"
                            style={{
                                ['--tilt-x-hover' as string]: '-2deg',
                                ['--tilt-y-hover' as string]: '4deg',
                                ['--lift-hover' as string]: '8px',
                                animationDelay: `${index * 0.06}s`,
                            }}
                        >
                            <div
                                className="flex items-center justify-between px-4 py-3"
                                style={{
                                    background: parentData?.color ? `${parentData.color}22` : undefined,
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <FolderTree className="size-4" style={{ color: parentData?.color ?? undefined }} />
                                    <div>
                                        <p className="font-semibold">{parent.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {parent.children.length} subcategories Â· {parentData?.products_count ?? 0} products
                                        </p>
                                    </div>
                                </div>
                                {canManage && (
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="size-8" onClick={() => parentData && openEdit(parentData)}>
                                            <Pencil className="size-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => parentData && setDeleteTarget(parentData)}>
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="divide-y">
                                {parent.children.map((child) => {
                                    const childData = categoriesById.get(child.id);

                                    return (
                                        <div key={child.id} className="flex items-center justify-between px-4 py-2.5">
                                            <div className="flex items-center gap-2">
                                                <span className="size-1.5 rounded-full" style={{ background: childData?.color ?? undefined }} />
                                                <span className="text-sm">{child.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    ({childData?.products_count ?? 0})
                                                </span>
                                            </div>
                                            {canManage && childData && (
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="size-7" onClick={() => openEdit(childData)}>
                                                        <Pencil className="size-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => setDeleteTarget(childData)}>
                                                        <Trash2 className="size-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {parent.children.length === 0 && (
                                    <p className="px-4 py-3 text-sm text-muted-foreground">No subcategories</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {tree.length === 0 && (
                <div className="flex flex-col items-center rounded-2xl border border-dashed py-20 text-center">
                    <FolderTree className="size-12 text-muted-foreground/40" />
                    <p className="mt-4 font-medium">No categories yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">Create a category to organize your products.</p>
                </div>
            )}

            {/* Create / Edit dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Category' : 'New Category'}</DialogTitle>
                        <DialogDescription>
                            {editing ? 'Update category details.' : 'Add a new category or subcategory.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Electronics"
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>
                        <div>
                            <Label>Parent (for subcategory)</Label>
                            <Select
                                value={data.parent_id}
                                onValueChange={(v) => setData('parent_id', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="None (top-level category)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">None (top-level)</SelectItem>
                                    {tree
                                        .filter((t) => t.id !== editing?.id)
                                        .map((parent) => (
                                            <SelectItem key={parent.id} value={String(parent.id)}>
                                                {parent.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.parent_id} className="mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="color">Color</Label>
                                <Input
                                    id="color"
                                    type="color"
                                    value={data.color || '#6366f1'}
                                    onChange={(e) => setData('color', e.target.value)}
                                    className="h-10 cursor-pointer p-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} className={cn('cursor-pointer')}>
                                {processing ? 'Saving...' : editing ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete category?</DialogTitle>
                        <DialogDescription>
                            This will permanently remove "{deleteTarget?.name}". Products in this category will remain but become uncategorized.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (deleteTarget) {
                                    destroy(`/categories/${deleteTarget.id}`, { preserveScroll: true });
                                }

                                setDeleteTarget(null);
                            }}
                        >
                            <Trash2 className="size-4" />
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Page>
    );
}
