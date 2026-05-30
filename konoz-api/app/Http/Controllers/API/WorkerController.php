<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Worker;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WorkerController extends Controller
{
    public function index(): JsonResponse
    {
        $workers = Worker::orderBy('name')->get();
        return response()->json($workers);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'phone'     => 'nullable|string|max:20',
            'joined_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $worker = Worker::create($validated);
        return response()->json($worker, 201);
    }

    public function show(Worker $worker): JsonResponse
    {
        return response()->json($worker);
    }

    public function update(Request $request, Worker $worker): JsonResponse
    {
        $validated = $request->validate([
            'name'      => 'sometimes|required|string|max:255',
            'phone'     => 'nullable|string|max:20',
            'joined_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $worker->update($validated);
        return response()->json($worker);
    }

    public function destroy(Worker $worker): JsonResponse
    {
        $worker->delete();
        return response()->json(['message' => 'تم حذف العامل بنجاح']);
    }
}
