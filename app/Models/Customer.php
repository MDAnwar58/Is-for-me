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
#[Fillable(['name', 'email', 'phone', 'address', 'city', 'country', 'opening_balance', 'balance', 'note', 'is_active'])]
class Customer extends Model
{
    use HasFactory;

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    public function totalSales(): float
    {
        return (float) $this->sales()->where('status', '!=', 'cancelled')->sum('total');
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
