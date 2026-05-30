<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReportGroup extends Model
{
    protected $fillable = [
        'daily_report_id',
        'extra_hours',
        'extra_duties',
    ];

    protected $casts = [
        'extra_hours' => 'float',
    ];

    public function dailyReport(): BelongsTo
    {
        return $this->belongsTo(DailyReport::class);
    }

    public function workers(): BelongsToMany
    {
        return $this->belongsToMany(Worker::class, 'report_group_worker');
    }

    public function productionItems(): HasMany
    {
        return $this->hasMany(ProductionItem::class);
    }
}
