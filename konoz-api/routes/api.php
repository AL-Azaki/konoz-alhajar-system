<?php

use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json([
    'status' => true,
    'message' => 'Konoz API working successfully'
    ]);
});