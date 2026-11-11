<?php

namespace App\Services;

use App\Models\AuditLog;

class AuditLogger
{
    public static function log(string $action, mixed $model, ?string $description = null): void
    {
        AuditLog::query()->create([
            'user_id' => auth()->id(),
            'action' => $action,
            'model_type' => is_object($model) ? $model::class : $model,
            'model_id' => is_object($model) ? $model->getKey() : null,
            'description' => $description,
            'ip_address' => request()->ip(),
        ]);
    }
}
