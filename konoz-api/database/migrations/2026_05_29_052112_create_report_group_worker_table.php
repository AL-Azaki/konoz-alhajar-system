<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Pivot table: many-to-many between report_groups and workers
        Schema::create('report_group_worker', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_group_id')->constrained('report_groups')->cascadeOnDelete();
            $table->foreignId('worker_id')->constrained('workers')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_group_worker');
    }
};
