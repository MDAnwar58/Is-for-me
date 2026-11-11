<?php

namespace App\Services;

use App\Models\AppNotification;
use App\Models\Product;

class NotificationService
{
    /**
     * Create a notification for all users when a product is low or out of stock.
     */
    public static function stockAlert(Product $product): void
    {
        $type = null;
        $title = null;

        if ($product->isOutOfStock()) {
            $type = 'out_of_stock';
            $title = "Out of stock: {$product->name}";
        } elseif ($product->isLowStock()) {
            $type = 'low_stock';
            $title = "Low stock: {$product->name}";
        }

        if ($type === null) {
            return;
        }

        $message = "Current stock is ".number_format((float) $product->stock_qty, 2)." (minimum {$product->min_stock}).";

        AppNotification::query()->create([
            'user_id' => null,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'link' => route('products.index', ['search' => $product->name]),
        ]);
    }

    public static function notify(string $type, string $title, ?string $message = null, ?string $link = null): void
    {
        AppNotification::query()->create([
            'user_id' => null,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'link' => $link,
        ]);
    }
}
