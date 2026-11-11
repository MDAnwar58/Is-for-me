<?php

namespace App\Services;

class InvoiceService
{
    /** Generate the next purchase invoice number, e.g. PUR-000001. */
    public static function purchaseInvoiceNo(): string
    {
        return self::next('purchases', 'PUR-');
    }

    /** Generate the next sale invoice number, e.g. INV-000001. */
    public static function saleInvoiceNo(): string
    {
        return self::next('sales', 'INV-');
    }

    private static function next(string $table, string $prefix): string
    {
        $last = \Illuminate\Support\Facades\DB::table($table)
            ->where('invoice_no', 'like', $prefix.'%')
            ->orderByDesc('invoice_no')
            ->value('invoice_no');

        $number = $last ? ((int) substr($last, strlen($prefix))) + 1 : 1;

        return $prefix.str_pad((string) $number, 6, '0', STR_PAD_LEFT);
    }
}
