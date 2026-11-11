import { Head, useForm } from '@inertiajs/react';
import { Boxes, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { usePermissions } from '@/lib/permissions';
import type { Brand } from '@/types/inventory';

type Props = {
    brands: (Brand & { products_count: number })[];
    filters: { search?: string };
};

export default function BrandsIndex({ brands }: Props) {
    const { can } = usePermissions();
    const canManage = can('manage brands');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Brand | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        description: '',
        is_active: true,
    });

    const openCreate = () => {
        setEditing(null);
        reset();
        setDialogOpen(true);
    };

    const openEdit = (brand: Brand) => {
        setEditing(brand);
        setData({
            name: brand.name,
            description: brand.description ?? '',
            is_active: brand.is_active,
        });
        setDialogOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editing) {
            put(`/brands/${editing.id}`, { preserveScroll: true, onSuccess: () => setDialogOpen(false) });
        } else {
            post('/brands', { preserveScroll: true, onSuccess: () => setDialogOpen(false) });
        }
    };

    return (
        <Page
            title="Brands"
            description="Manage product brands"
            breadcrumbs={[{ title: 'Brands', href: '/brands' }]}
            actions={
                canManage ? (
                    <Button onClick={openCreate} className="cursor-pointer rounded-full shadow-3d">
                        <Plus className="size-4" />
                        New Brand
                    </Button>
                ) : undefined
            }
        >
            <Head title="Brands" />
            <SearchInput placeholder="Search brands..." />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {brands.map((brand, index) => (
                    <div
                        key={brand.id}
                        className="tilt-card flex items-center justify-between rounded-2xl border bg-card p-4 shadow-3d animate-fade-up"
                        style={{
                            ['--tilt-x-hover' as string]: '-2deg',
                            ['--tilt-y-hover' as string]: '4deg',
                            ['--lift-hover' as string]: '8px',
                            animationDelay: `${index * 0.05}s`,
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/15 to-cyan-500/15 text-sky-600 dark:text-sky-400" style={{ transform: 'translateZ(16px)' }}>
                                <Boxes className="size-5" />
                            </div>
                            <div>
                                <p className="font-semibold">{brand.name}</p>
                                <p className="text-xs text-muted-foreground">{brand.products_count} products</p>
                            </div>
                        </div>
                        {canManage && (
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(brand)}>
                                    <Pencil className="size-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => setDeleteTarget(brand)}>
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {brands.length === 0 && (
                <div className="flex flex-col items-center rounded-2xl border border-dashed py-20 text-center">
                    <Boxes className="size-12 text-muted-foreground/40" />
                    <p className="mt-4 font-medium">No brands yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">Create a brand to organize products.</p>
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Brand' : 'New Brand'}</DialogTitle>
                        <DialogDescription>
                            {editing ? 'Update brand details.' : 'Add a new brand.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Samsung"
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : editing ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete brand?</DialogTitle>
                        <DialogDescription>
                            This will permanently remove "{deleteTarget?.name}".
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
                                    destroy(`/brands/${deleteTarget.id}`, { preserveScroll: true });
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
