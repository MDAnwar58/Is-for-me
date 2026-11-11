<?php

namespace App\Enums;

enum SaleStatus: string
{
    case Completed = 'completed';
    case Returned = 'returned';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Completed => 'Completed',
            self::Returned => 'Returned',
            self::Cancelled => 'Cancelled',
        };
    }
}
