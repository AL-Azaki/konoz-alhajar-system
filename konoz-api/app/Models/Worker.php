<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Worker extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'joined_at',
        'is_active',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'joined_at'  => 'date:Y-m-d',
    ];

    public function reportGroups(): BelongsToMany
    {
        return $this->belongsToMany(ReportGroup::class, 'report_group_worker');
    }
}
