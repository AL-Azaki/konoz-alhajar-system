<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RoleAndUserSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Roles
        $executiveRole = Role::create(['name' => 'executive_manager']);
        $factoryRole = Role::create(['name' => 'factory_admin']);
        $dataEntryRole = Role::create(['name' => 'data_entry']);

        // Create Executive Manager
        $executive = User::firstOrCreate(
            ['email' => 'admin@konoz.com'],
            [
                'name' => 'المدير التنفيذي',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );
        $executive->assignRole($executiveRole);

        // Create Factory Admin
        $factory = User::firstOrCreate(
            ['email' => 'factory@konoz.com'],
            [
                'name' => 'مدير المصنع',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );
        $factory->assignRole($factoryRole);

        // Create Data Entry
        $dataEntry = User::firstOrCreate(
            ['email' => 'data@konoz.com'],
            [
                'name' => 'مدخل بيانات',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );
        $dataEntry->assignRole($dataEntryRole);
    }
}
