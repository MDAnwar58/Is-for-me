<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * @property int $id
 * @property int $product_id
 * @property string $type
 * @property float $quantity
 * @property float $balance
 */
#[Fillable(['product_id', 'type', 'quantity', 'balance', 'reference_type', 'reference_id', 'note', 'user_id'])]
class StockMovement extends Model
{
    use HasFactory;

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'balance' => 'decimal:2',
        ];
    }
}
