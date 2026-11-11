import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Brand, Product } from '@/types/inventory';

type CategoryOption = {
    id: number;
    name: string;
    children: { id: number; name: string }[];
};

export function ProductForm({
    product,
    categories,
    brands,
}: {
    product?: Product;
    categories: CategoryOption[];
    brands: Pick<Brand, 'id' | 'name'>[];
}) {
    const isEdit = !!product;

    const { data, setData, post, put, transform, processing, errors } = useForm({
        name: product?.name ?? '',
        sku: product?.sku ?? '',
        barcode: product?.barcode ?? '',
        brand_id: product?.brand_id ? String(product.brand_id) : '',
        category_id: product?.category_id ? String(product.category_id) : '',
        cost_price: product?.cost_price ?? '',
        selling_price: product?.selling_price ?? '',
        discount_price: product?.discount_price ?? '',
        min_stock: product?.min_stock ?? '5',
        purchase_limit: product?.purchase_limit ?? '',
        is_active: product?.is_active ?? true,
        description: product?.description ?? '',
        image: null as File | null,
    });

    const [preview, setPreview] = useState<string | null>(product?.image ? `/storage/${product.image}` : null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;

        setData('image', file);
        setPreview((prev) => {
            if (prev && !prev.startsWith('/storage/')) {
                URL.revokeObjectURL(prev);
            }

            return file ? URL.createObjectURL(file) : null;
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        transform((formData) => ({ ...formData, image: formData.image ?? undefined }));

        if (isEdit) {
            put(`/products/${product!.id}`);
        } else {
            post('/products');
        }
    };

    return (
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
                <Card className="shadow-3d">
                    <CardHeader>
                        <CardTitle className="text-base">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Label htmlFor="name">Product Name *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Samsung Galaxy S24"
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="sku">SKU *</Label>
                            <Input
                                id="sku"
                                value={data.sku}
                                onChange={(e) => setData('sku', e.target.value)}
                                placeholder="e.g. SKU-0001"
                            />
                            <InputError message={errors.sku} className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="barcode">Barcode</Label>
                            <Input
                                id="barcode"
                                value={data.barcode ?? ''}
                                onChange={(e) => setData('barcode', e.target.value)}
                                placeholder="e.g. 8901234567890"
                            />
                            <InputError message={errors.barcode} className="mt-1" />
                        </div>

                        <div>
                            <Label>Category</Label>
                            <Select
                                value={data.category_id}
                                onValueChange={(v) => setData('category_id', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <div key={category.id}>
                                            <SelectItem value={String(category.id)}>{category.name}</SelectItem>
                                            {category.children.map((child) => (
                                                <SelectItem key={child.id} value={String(child.id)}>
                                                    â”” {child.name}
                                                </SelectItem>
                                            ))}
                                        </div>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.category_id} className="mt-1" />
                        </div>

                        <div>
                            <Label>Brand</Label>
                            <Select
                                value={data.brand_id}
                                onValueChange={(v) => setData('brand_id', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select brand" />
                                </SelectTrigger>
                                <SelectContent>
                                    {brands.map((brand) => (
                                        <SelectItem key={brand.id} value={String(brand.id)}>
                                            {brand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.brand_id} className="mt-1" />
                        </div>

                        <div className="sm:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description ?? ''}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Product details..."
                                rows={4}
                            />
                            <InputError message={errors.description} className="mt-1" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-3d">
                    <CardHeader>
                        <CardTitle className="text-base">Pricing & Stock</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="cost_price">Cost / Purchase Price *</Label>
                            <Input
                                id="cost_price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.cost_price}
                                onChange={(e) => setData('cost_price', e.target.value)}
                            />
                            <InputError message={errors.cost_price} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="selling_price">Selling Price *</Label>
                            <Input
                                id="selling_price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.selling_price}
                                onChange={(e) => setData('selling_price', e.target.value)}
                            />
                            <InputError message={errors.selling_price} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="discount_price">Discount Price</Label>
                            <Input
                                id="discount_price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.discount_price ?? ''}
                                onChange={(e) => setData('discount_price', e.target.value)}
                            />
                            <InputError message={errors.discount_price} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="min_stock">Minimum Stock Level *</Label>
                            <Input
                                id="min_stock"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.min_stock}
                                onChange={(e) => setData('min_stock', e.target.value)}
                            />
                            <InputError message={errors.min_stock} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="purchase_limit">Purchase Limit</Label>
                            <Input
                                id="purchase_limit"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.purchase_limit ?? ''}
                                onChange={(e) => setData('purchase_limit', e.target.value)}
                            />
                            <InputError message={errors.purchase_limit} className="mt-1" />
                        </div>
                        <div className="flex items-end pb-1">
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked === true)}
                                />
                                Active product
                            </label>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="shadow-3d">
                    <CardHeader>
                        <CardTitle className="text-base">Product Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-muted/40">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="size-full object-cover" />
                                ) : (
                                    <span className="text-xs text-muted-foreground">No image</span>
                                )}
                            </div>
                            <Label
                                htmlFor="image"
                                className="cursor-pointer rounded-full border px-4 py-2 text-sm font-medium hover:bg-accent"
                            >
                                Upload image
                            </Label>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                            <InputError message={errors.image} className="mt-1" />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-3">
                    <Button type="submit" className="flex-1 cursor-pointer" disabled={processing}>
                        <Save className="size-4" />
                        {processing ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
                    </Button>
                    <Button asChild variant="outline" className="cursor-pointer">
                        <Link href="/products">
                            <ArrowLeft className="size-4" />
                            Back
                        </Link>
                    </Button>
                </div>
            </div>
        </form>
    );
}
