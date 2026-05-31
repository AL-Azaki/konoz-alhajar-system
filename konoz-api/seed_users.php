<?php
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

Role::firstOrCreate(['name' => 'executive_manager']);
Role::firstOrCreate(['name' => 'data_entry']);
$admin = User::firstOrCreate(['email' => 'admin@konoz.com'], ['name' => 'Admin Test', 'password' => Hash::make('password'), 'is_active' => true]);
$admin->assignRole('executive_manager');
$dataEntry = User::firstOrCreate(['email' => 'data@konoz.com'], ['name' => 'Data Entry Test', 'password' => Hash::make('password'), 'is_active' => true]);
$dataEntry->assignRole('data_entry');
echo "Test users created successfully!\n";
