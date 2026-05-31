<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DailyReport;
use App\Models\ReportGroup;
use App\Models\ProductionItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DailyReportController extends Controller
{
    /**
     * List all reports with their groups, workers, and production items
     */
    public function index(): JsonResponse
    {
        $reports = DailyReport::with(['groups.workers', 'groups.productionItems', 'user', 'updater'])
            ->orderByDesc('report_date')
            ->orderByDesc('created_at')
            ->get();

        // Transform to match the frontend data structure
        $transformed = $reports->map(fn ($report) => $this->transformReport($report));

        return response()->json($transformed);
    }

    /**
     * Store a new daily report with all its groups and production items
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date'                                         => 'required|date',
            'created_by'                                   => 'nullable|string|max:255',
            'groups'                                       => 'required|array|min:1',
            'groups.*.workerIds'                           => 'required|array|min:1',
            'groups.*.workerIds.*'                         => 'integer|exists:workers,id',
            'groups.*.extraHours'                          => 'numeric|min:0',
            'groups.*.extraDuties'                         => 'nullable|string',
            'groups.*.productionItems'                     => 'required|array|min:1',
            'groups.*.productionItems.*.workType'          => 'required|string',
            'groups.*.productionItems.*.productionType'    => 'required|string',
            'groups.*.productionItems.*.size'              => 'required|string',
            'groups.*.productionItems.*.quantity'          => 'required|integer|min:0',
            'groups.*.productionItems.*.unit'              => 'required|string',
        ]);

        DB::beginTransaction();
        try {
            $report = DailyReport::create([
                'report_date' => $validated['date'],
                'legacy_created_by'  => $validated['created_by'] ?? null,
                'user_id' => auth()->id(),
                'updated_by_user_id' => auth()->id(),
            ]);

            foreach ($validated['groups'] as $groupData) {
                $group = ReportGroup::create([
                    'daily_report_id' => $report->id,
                    'extra_hours'     => $groupData['extraHours'] ?? 0,
                    'extra_duties'    => $groupData['extraDuties'] ?? null,
                ]);

                // Attach workers (pivot)
                $group->workers()->attach($groupData['workerIds']);

                // Create production items
                foreach ($groupData['productionItems'] as $item) {
                    ProductionItem::create([
                        'report_group_id' => $group->id,
                        'work_type'       => $item['workType'],
                        'production_type' => $item['productionType'],
                        'size'            => $item['size'],
                        'quantity'        => $item['quantity'],
                        'unit'            => $item['unit'],
                    ]);
                }
            }

            DB::commit();

            $report->load(['groups.workers', 'groups.productionItems', 'user', 'updater']);
            return response()->json($this->transformReport($report), 201);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'حدث خطأ أثناء حفظ التقرير: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Show a single report
     */
    public function show(DailyReport $dailyReport): JsonResponse
    {
        $dailyReport->load(['groups.workers', 'groups.productionItems', 'user', 'updater']);
        return response()->json($this->transformReport($dailyReport));
    }

    /**
     * Update a report (delete old groups and recreate)
     */
    public function update(Request $request, DailyReport $dailyReport): JsonResponse
    {
        $validated = $request->validate([
            'date'                                         => 'required|date',
            'created_by'                                   => 'nullable|string|max:255',
            'groups'                                       => 'required|array|min:1',
            'groups.*.workerIds'                           => 'required|array|min:1',
            'groups.*.workerIds.*'                         => 'integer|exists:workers,id',
            'groups.*.extraHours'                          => 'numeric|min:0',
            'groups.*.extraDuties'                         => 'nullable|string',
            'groups.*.productionItems'                     => 'required|array|min:1',
            'groups.*.productionItems.*.workType'          => 'required|string',
            'groups.*.productionItems.*.productionType'    => 'required|string',
            'groups.*.productionItems.*.size'              => 'required|string',
            'groups.*.productionItems.*.quantity'          => 'required|integer|min:0',
            'groups.*.productionItems.*.unit'              => 'required|string',
        ]);

        DB::beginTransaction();
        try {
            $user = auth()->user();
            if (!$user->hasRole('executive_manager') && $dailyReport->user_id !== $user->id) {
                return response()->json(['message' => 'عذراً، لا يمكنك تعديل تقرير قام بإنشائه مستخدم آخر.'], 403);
            }

            $dailyReport->update([
                'report_date' => $validated['date'],
                'legacy_created_by'  => $validated['created_by'] ?? null,
                'updated_by_user_id' => auth()->id(),
            ]);

            // Delete old groups (cascade deletes items and pivots)
            $dailyReport->groups()->delete();

            foreach ($validated['groups'] as $groupData) {
                $group = ReportGroup::create([
                    'daily_report_id' => $dailyReport->id,
                    'extra_hours'     => $groupData['extraHours'] ?? 0,
                    'extra_duties'    => $groupData['extraDuties'] ?? null,
                ]);

                $group->workers()->attach($groupData['workerIds']);

                foreach ($groupData['productionItems'] as $item) {
                    ProductionItem::create([
                        'report_group_id' => $group->id,
                        'work_type'       => $item['workType'],
                        'production_type' => $item['productionType'],
                        'size'            => $item['size'],
                        'quantity'        => $item['quantity'],
                        'unit'            => $item['unit'],
                    ]);
                }
            }

            DB::commit();

            $dailyReport->load(['groups.workers', 'groups.productionItems', 'user', 'updater']);
            return response()->json($this->transformReport($dailyReport));

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'حدث خطأ أثناء تحديث التقرير: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Delete a report
     */
    public function destroy(DailyReport $dailyReport): JsonResponse
    {
        $dailyReport->delete(); // Cascade deletes groups, items, and pivots
        return response()->json(['message' => 'تم حذف التقرير بنجاح']);
    }

    /**
     * Transform a DailyReport model to match the frontend's expected structure
     */
    private function transformReport(DailyReport $report): array
    {
        // Name of the user who created the report
        $creatorName = $report->user ? $report->user->name : $report->legacy_created_by;
        
        // Name of the user who last updated the report
        $updaterName = $report->updater ? $report->updater->name : null;
        
        // Prepare a descriptive text for the frontend
        $createdByText = $creatorName;
        if ($updaterName && $updaterName !== $creatorName) {
            $createdByText .= ' (آخر تعديل: ' . $updaterName . ')';
        }

        return [
            'id'         => (string) $report->id,
            'date'       => $report->report_date->format('Y-m-d'),
            'created_by' => $createdByText,
            'createdAt'  => $report->created_at->toISOString(),
            'groups'     => $report->groups->map(fn ($group) => [
                'id'              => (string) $group->id,
                'workerIds'       => $group->workers->pluck('id')->toArray(),
                'extraHours'      => (float) $group->extra_hours,
                'extraDuties'     => $group->extra_duties ?? '',
                'productionItems' => $group->productionItems->map(fn ($item) => [
                    'id'             => (string) $item->id,
                    'workType'       => $item->work_type,
                    'productionType' => $item->production_type,
                    'size'           => $item->size,
                    'quantity'       => (int) $item->quantity,
                    'unit'           => $item->unit,
                ])->toArray(),
            ])->toArray(),
        ];
    }
}
