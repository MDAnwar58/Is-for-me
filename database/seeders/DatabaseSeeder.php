<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
        ]);

        $admin = User::query()->firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Admin User', 'password' => 'password'],
        );
        $admin->syncRoles([UserRole::Admin->value]);

        $manager = User::query()->firstOrCreate(
            ['email' => 'manager@example.com'],
            ['name' => 'Manager User', 'password' => 'password'],
        );
        $manager->syncRoles([UserRole::Manager->value]);

        $staff = User::query()->firstOrCreate(
            ['email' => 'staff@example.com'],
            ['name' => 'Staff User', 'password' => 'password'],
        );
        $staff->syncRoles([UserRole::Staff->value]);

        $this->call([
            DemoDataSeeder::class,
        ]);
    }
}
