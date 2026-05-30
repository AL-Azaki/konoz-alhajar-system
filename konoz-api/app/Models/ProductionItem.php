<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductionItem extends Model
{
    protected $fillable = [
        'report_group_id',
        'work_type',
        'production_type',
        'size',
        'quantity',
        'unit',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    public function reportGroup(): BelongsTo
    {
        return $this->belongsTo(ReportGroup::class);
    }
}
