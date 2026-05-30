<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DailyReport extends Model
{
    protected $fillable = [
        'report_date',
        'legacy_created_by',
        'user_id',
        'updated_by_user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by_user_id');
    }

    protected $casts = [
        'report_date' => 'date:Y-m-d',
    ];

    public function groups(): HasMany
    {
        return $this->hasMany(ReportGroup::class)->with(['workers', 'productionItems']);
    }
}
