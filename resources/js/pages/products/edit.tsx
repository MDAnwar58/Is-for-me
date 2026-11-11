import { Head } from '@inertiajs/react';
import { Page } from '@/components/page';
import { ProductForm } from '@/components/product-form';
import type { Brand, Product } from '@/types/inventory';

type Props = {
    product: Product;
    categories: { id: number; name: string; children: { id: number; name: string }[] }[];
    brands: Pick<Brand, 'id' | 'name'>[];
};

export default function ProductsEdit({ product, categories, brands }: Props) {
    return (
        <Page
            title={`Edit ${product.name}`}
            description="Update product details"
            breadcrumbs={[
                { title: 'Products', href: '/products' },
                { title: product.name, href: `/products/${product.id}/edit` },
            ]}
        >
            <Head title={`Edit ${product.name}`} />
            <ProductForm product={product} categories={categories} brands={brands} />
        </Page>
    );
}
