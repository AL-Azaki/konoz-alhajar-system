<?php

use Illuminate\Support\Facades\Route;

Route::get('/workers', function () {
    return response()->json([
    [
    'id' => 1,
    'name' => 'Bashir'
    ],
    [
    'id' => 2,
    'name' => 'Ali'
    ]
    ]);
});