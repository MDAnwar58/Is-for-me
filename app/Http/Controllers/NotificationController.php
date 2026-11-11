<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $notifications = AppNotification::query()
            ->where(function ($q) use ($request) {
                $q->whereNull('user_id')->orWhere('user_id', $request->user()->id);
            })
            ->latest()
            ->paginate(20);

        $unread = AppNotification::query()
            ->where(function ($q) use ($request) {
                $q->whereNull('user_id')->orWhere('user_id', $request->user()->id);
            })
            ->where('is_read', false)
            ->count();

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
            'unread' => $unread,
        ]);
    }

    public function unreadCount(Request $request): int
    {
        return AppNotification::query()
            ->where(function ($q) use ($request) {
                $q->whereNull('user_id')->orWhere('user_id', $request->user()->id);
            })
            ->where('is_read', false)
            ->count();
    }

    public function markRead(Request $request, AppNotification $notification): RedirectResponse
    {
        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return back();
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        AppNotification::query()
            ->where(function ($q) use ($request) {
                $q->whereNull('user_id')->orWhere('user_id', $request->user()->id);
            })
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return back();
    }
}
