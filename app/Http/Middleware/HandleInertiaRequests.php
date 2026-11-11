<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
                'permissions' => $request->user()?->getAllPermissions()->pluck('name') ?? [],
                'roles' => $request->user()?->roles->pluck('name') ?? [],
            ],
            'notifications' => $request->user()
                ? [
                    'items' => \App\Models\AppNotification::query()
                        ->where(fn ($q) => $q->whereNull('user_id')->orWhere('user_id', $request->user()->id))
                        ->latest()
                        ->limit(8)
                        ->get(),
                    'unread_count' => \App\Models\AppNotification::query()
                        ->where(fn ($q) => $q->whereNull('user_id')->orWhere('user_id', $request->user()->id))
                        ->where('is_read', false)
                        ->count(),
                    'read_url' => '/notifications/__id__/read',
                    'read_all_url' => '/notifications/read-all',
                ]
                : ['items' => [], 'unread_count' => 0, 'read_url' => null, 'read_all_url' => null],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
