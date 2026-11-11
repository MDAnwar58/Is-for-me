<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Unpaid = 'unpaid';
    case Partial = 'partial';
    case Paid = 'paid';

    public function label(): string
    {
        return match ($this) {
            self::Unpaid => 'Unpaid',
            self::Partial => 'Partially Paid',
            self::Paid => 'Paid',
        };
    }

    public static function fromAmounts(float $total, float $paid): self
    {
        if ($paid <= 0) {
            return self::Unpaid;
        }

        if ($paid >= $total) {
            return self::Paid;
        }

        return self::Partial;
    }
}
