<?php

namespace App\Enums;

enum StockMovementType: string
{
    case Purchase = 'purchase';
    case Sale = 'sale';
    case SaleReturn = 'sale_return';
    case PurchaseReturn = 'purchase_return';
    case Adjustment = 'adjustment';
    case TransferIn = 'transfer_in';
    case TransferOut = 'transfer_out';
    case Damaged = 'damaged';

    public function label(): string
    {
        return match ($this) {
            self::Purchase => 'Purchase',
            self::Sale => 'Sale',
            self::SaleReturn => 'Sale Return',
            self::PurchaseReturn => 'Purchase Return',
            self::Adjustment => 'Stock Adjustment',
            self::TransferIn => 'Transfer In',
            self::TransferOut => 'Transfer Out',
            self::Damaged => 'Damaged',
        };
    }

    public function direction(): int
    {
        return in_array($this, [self::Sale, self::PurchaseReturn, self::TransferOut, self::Damaged]) ? -1 : 1;
    }

    /** @return array<int, array{value: string, label: string, direction: int}> */
    public static function options(): array
    {
        return array_map(fn (self $t) => ['value' => $t->value, 'label' => $t->label(), 'direction' => $t->direction()], self::cases());
    }
}
