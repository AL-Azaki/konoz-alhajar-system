<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\WorkerController;
use App\Http\Controllers\API\DailyReportController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Only Executive Manager can manage users
    Route::middleware('role:executive_manager')->group(function () {
        Route::apiResource('users', UserController::class);
    });

    // Workers CRUD (Data Entry and Executive Manager can manage workers)
    Route::middleware('role:executive_manager|data_entry')->group(function () {
        Route::apiResource('workers', WorkerController::class);
    });

    // Daily Reports CRUD (All roles can access, but we will protect specific actions in controller or via policies if needed)
    Route::apiResource('daily-reports', DailyReportController::class);
});
