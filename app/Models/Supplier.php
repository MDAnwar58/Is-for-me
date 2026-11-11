<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $balance
 */
#[Fillable(['name', 'company', 'email', 'phone', 'mobile', 'address', 'city', 'country', 'tax_id', 'opening_balance', 'balance', 'note', 'is_active'])]
class Supplier extends Model
{
    use HasFactory;

    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class);
    }

    public function totalPurchases(): float
    {
        return (float) $this->purchases()->where('status', '!=', 'cancelled')->sum('total');
    }

    protected function casts(): array
    {
        return [
            'opening_balance' => 'decimal:2',
            'balance' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }
}
