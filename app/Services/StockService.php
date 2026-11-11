<?php

namespace App\Services;

use App\Enums\StockMovementType;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;

class StockService
{
    /**
     * Apply a stock change to a product atomically and record the movement.
     *
     * @param  StockMovementType  $type  movement type
     * @param  int  $productId  product id
     * @param  float  $quantity  absolute (positive) quantity
     * @param  string|null  $referenceType  e.g. App\Models\Sale
     * @param  int|null  $referenceId  related record id
     * @param  string|null  $note  optional note
     */
    public function move(
        StockMovementType $type,
        int $productId,
        float $quantity,
        ?string $referenceType = null,
        ?int $referenceId = null,
        ?string $note = null,
    ): StockMovement {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be greater than zero.');
        }

        return DB::transaction(function () use ($type, $productId, $quantity, $referenceType, $referenceId, $note) {
            /** @var Product $product */
            $product = Product::query()->lockForUpdate()->findOrFail($productId);

            $delta = $quantity * $type->direction();
            $newBalance = (float) $product->stock_qty + $delta;

            if ($newBalance < 0) {
                throw new \RuntimeException("Insufficient stock for {$product->name}.");
            }

            $product->update(['stock_qty' => $newBalance]);

            $movement = StockMovement::query()->create([
                'product_id' => $productId,
                'type' => $type->value,
                'quantity' => $delta,
                'balance' => $newBalance,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'note' => $note,
                'user_id' => auth()->id(),
            ]);

            NotificationService::stockAlert($product);

            return $movement;
        });
    }

    /** Increase stock (purchase, sale return, transfer in, positive adjustment). */
    public function increase(
        StockMovementType $type,
        int $productId,
        float $quantity,
        ?string $referenceType = null,
        ?int $referenceId = null,
        ?string $note = null,
    ): StockMovement {
        return $this->move($type, $productId, $quantity, $referenceType, $referenceId, $note);
    }

    /** Decrease stock (sale, purchase return, transfer out, damaged, negative adjustment). */
    public function decrease(
        StockMovementType $type,
        int $productId,
        float $quantity,
        ?string $referenceType = null,
        ?int $referenceId = null,
        ?string $note = null,
    ): StockMovement {
        return $this->move($type, $productId, $quantity, $referenceType, $referenceId, $note);
    }
}
