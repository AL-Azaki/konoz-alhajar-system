<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('production_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_group_id')->constrained('report_groups')->cascadeOnDelete();
            $table->string('work_type');       // حجر منقبي، بازلت، تنظيف...
            $table->string('production_type'); // محكوم، عادي
            $table->string('size');            // 20 سم، 30 سم...
            $table->integer('quantity')->default(0);
            $table->string('unit');            // طبلية، رصة، قطعة...
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('production_items');
    }
};
