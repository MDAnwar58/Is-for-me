import { Head } from '@inertiajs/react';
import { Page } from '@/components/page';
import { ProductForm } from '@/components/product-form';
import type { Brand } from '@/types/inventory';

type Props = {
    categories: { id: number; name: string; children: { id: number; name: string }[] }[];
    brands: Pick<Brand, 'id' | 'name'>[];
};

export default function ProductsCreate({ categories, brands }: Props) {
    return (
        <Page
            title="New Product"
            description="Add a new product to your inventory"
            breadcrumbs={[
                { title: 'Products', href: '/products' },
                { title: 'New Product', href: '/products/create' },
            ]}
        >
            <Head title="New Product" />
            <ProductForm categories={categories} brands={brands} />
        </Page>
    );
}
