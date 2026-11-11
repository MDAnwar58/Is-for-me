export type Category = {
    id: number;
    name: string;
    slug: string;
    parent_id: number | null;
    color?: string | null;
    icon?: string | null;
    description?: string | null;
    is_active: boolean;
    children?: Category[];
    products_count?: number;
    children_count?: number;
    created_at: string;
};

export type Brand = {
    id: number;
    name: string;
    slug: string;
    logo?: string | null;
    description?: string | null;
    is_active: boolean;
    products_count?: number;
    created_at: string;
};

export type Product = {
    id: number;
    name: string;
    sku: string;
    barcode?: string | null;
    image?: string | null;
    brand_id?: number | null;
    category_id?: number | null;
    cost_price: string | number;
    selling_price: string | number;
    discount_price?: string | number | null;
    stock_qty: string | number;
    min_stock: string | number;
    purchase_limit?: string | number | null;
    is_active: boolean;
    description?: string | null;
    brand?: { id: number; name: string } | null;
    category?: { id: number; name: string } | null;
    created_at: string;
};

export type Supplier = {
    id: number;
    name: string;
    company?: string | null;
    email?: string | null;
    phone?: string | null;
    mobile?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    tax_id?: string | null;
    opening_balance: string | number;
    balance: string | number;
    note?: string | null;
    is_active: boolean;
    purchases_count?: number;
    total_purchase_amount?: string | number;
    created_at: string;
};

export type Customer = {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    opening_balance: string | number;
    balance: string | number;
    note?: string | null;
    is_active: boolean;
    sales_count?: number;
    total_sale_amount?: string | number;
    created_at: string;
};

export type StockMovement = {
    id: number;
    product_id: number;
    type: string;
    quantity: string | number;
    balance: string | number;
    reference_type?: string | null;
    reference_id?: number | null;
    note?: string | null;
    user_id?: number | null;
    product?: { id: number; name: string; sku: string; image?: string | null };
    user?: { id: number; name: string };
    created_at: string;
};

export type PurchaseItem = {
    id: number;
    product_id: number;
    quantity: string | number;
    unit_cost: string | number;
    total: string | number;
    product?: { id: number; name: string; sku: string; image?: string | null };
};

export type Purchase = {
    id: number;
    invoice_no: string;
    supplier_id: number | null;
    date: string;
    subtotal: string | number;
    discount: string | number;
    tax: string | number;
    total: string | number;
    paid: string | number;
    due: string | number;
    payment_status: string;
    payment_method?: string | null;
    status: string;
    note?: string | null;
    user_id?: number | null;
    supplier?: { id: number; name: string } | null;
    user?: { id: number; name: string };
    items?: PurchaseItem[];
    payments?: Payment[];
    created_at: string;
};

export type SaleItem = {
    id: number;
    product_id: number;
    quantity: string | number;
    unit_price: string | number;
    discount: string | number;
    total: string | number;
    product?: { id: number; name: string; sku: string; image?: string | null };
};

export type Sale = {
    id: number;
    invoice_no: string;
    customer_id: number | null;
    date: string;
    subtotal: string | number;
    discount: string | number;
    tax: string | number;
    total: string | number;
    paid: string | number;
    due: string | number;
    payment_status: string;
    payment_method?: string | null;
    status: string;
    note?: string | null;
    user_id?: number | null;
    customer?: { id: number; name: string } | null;
    user?: { id: number; name: string };
    items?: SaleItem[];
    payments?: Payment[];
    created_at: string;
};

export type Payment = {
    id: number;
    payable_type: string;
    payable_id: number;
    date: string;
    amount: string | number;
    payment_method: string;
    reference?: string | null;
    note?: string | null;
    user_id?: number | null;
    payable?: Sale | Purchase | Customer | Supplier | null;
    user?: { id: number; name: string };
    created_at: string;
};

export type ExpenseCategory = {
    id: number;
    name: string;
    description?: string | null;
    is_active: boolean;
    expenses_count?: number;
    expenses_sum_amount?: string | number;
};

export type Expense = {
    id: number;
    expense_category_id?: number | null;
    title: string;
    description?: string | null;
    date: string;
    amount: string | number;
    payment_method: string;
    reference?: string | null;
    user_id?: number | null;
    category?: { id: number; name: string } | null;
    user?: { id: number; name: string };
    created_at: string;
};

export type AppNotification = {
    id: number;
    user_id: number | null;
    type: string;
    title: string;
    message?: string | null;
    link?: string | null;
    is_read: boolean;
    read_at?: string | null;
    created_at: string;
};

export type AuditLog = {
    id: number;
    user_id: number | null;
    action: string;
    model_type?: string | null;
    model_id?: number | null;
    description?: string | null;
    ip_address?: string | null;
    user?: { id: number; name: string };
    created_at: string;
};

export type UserRecord = {
    id: number;
    name: string;
    email: string;
    created_at: string;
    roles?: { id: number; name: string }[];
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    first_page_url: string | null;
    from: number | null;
    last_page: number;
    last_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};
