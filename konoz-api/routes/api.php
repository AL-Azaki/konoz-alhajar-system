<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\WorkerController;
use App\Http\Controllers\API\DailyReportController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserController;

// Public routes
Route::post('/login', [AuthController::class , 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class , 'user']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class , 'logout']);

    // Only Executive Manager can manage users
    Route::middleware('role:executive_manager')->group(function () {
            Route::apiResource('users', UserController::class);
        }
        );

        // Workers CRUD (Data Entry and Executive Manager can manage workers)
        Route::middleware('role:executive_manager|data_entry')->group(function () {
            Route::apiResource('workers', WorkerController::class);
        }
        );

        // Daily Reports CRUD
        Route::middleware('role:executive_manager')->group(function () {
            Route::delete('daily-reports/{daily_report}', [DailyReportController::class, 'destroy']);
        });

        Route::middleware('role:executive_manager|data_entry|factory_admin')->group(function () {
            Route::apiResource('daily-reports', DailyReportController::class)->except(['destroy']);
        });
});
