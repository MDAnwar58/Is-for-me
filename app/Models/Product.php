<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $sku
 * @property string|null $barcode
 * @property float $stock_qty
 * @property float $min_stock
 * @property float $cost_price
 * @property float $selling_price
 */
#[Fillable(['name', 'sku', 'barcode', 'image', 'brand_id', 'category_id', 'cost_price', 'selling_price', 'discount_price', 'stock_qty', 'min_stock', 'purchase_limit', 'is_active', 'description'])]
class Product extends Model
{
    use HasFactory;

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function purchaseItems(): HasMany
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function isLowStock(): bool
    {
        return $this->stock_qty > 0 && $this->stock_qty <= $this->min_stock;
    }

    public function isOutOfStock(): bool
    {
        return $this->stock_qty <= 0;
    }

    public function effectivePrice(): float
    {
        if ($this->discount_price !== null && $this->discount_price > 0 && $this->discount_price < $this->selling_price) {
            return (float) $this->discount_price;
        }

        return (float) $this->selling_price;
    }

    public function stockValue(): float
    {
        return (float) $this->stock_qty * (float) $this->cost_price;
    }

    protected function casts(): array
    {
        return [
            'cost_price' => 'decimal:2',
            'selling_price' => 'decimal:2',
            'discount_price' => 'decimal:2',
            'stock_qty' => 'decimal:2',
            'min_stock' => 'decimal:2',
            'purchase_limit' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }
}
