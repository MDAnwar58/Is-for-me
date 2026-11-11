<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'view products',
            'manage products',
            'manage categories',
            'manage brands',
            'view suppliers',
            'manage suppliers',
            'view customers',
            'manage customers',
            'view purchases',
            'manage purchases',
            'view sales',
            'manage sales',
            'view stock',
            'manage stock',
            'view expenses',
            'manage expenses',
            'view payments',
            'manage payments',
            'view reports',
            'manage users',
        ];

        foreach ($permissions as $permission) {
            Permission::query()->firstOrCreate(['name' => $permission]);
        }

        $admin = Role::query()->firstOrCreate(['name' => UserRole::Admin->value]);
        $manager = Role::query()->firstOrCreate(['name' => UserRole::Manager->value]);
        $staff = Role::query()->firstOrCreate(['name' => UserRole::Staff->value]);

        $admin->syncPermissions($permissions);

        $manager->syncPermissions([
            'view products', 'manage products',
            'manage categories', 'manage brands',
            'view suppliers', 'manage suppliers',
            'view customers', 'manage customers',
            'view purchases', 'manage purchases',
            'view sales', 'manage sales',
            'view stock', 'manage stock',
            'view expenses', 'manage expenses',
            'view payments', 'manage payments',
            'view reports',
        ]);

        $staff->syncPermissions([
            'view products', 'manage products',
            'view suppliers', 'view customers',
            'view purchases', 'view sales', 'manage sales',
            'view stock', 'view expenses',
            'view payments',
        ]);
    }
}
