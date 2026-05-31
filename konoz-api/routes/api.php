<?php

use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json([
    'status' => true,
    'message' => 'Konoz API working successfully'
    ]);
});

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