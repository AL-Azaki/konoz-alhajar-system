<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'is_active')) {
                $table->boolean('is_active')->default(true);
            }
        });

        Schema::table('daily_reports', function (Blueprint $table) {
            // Drop old string column if exists
            if (Schema::hasColumn('daily_reports', 'created_by')) {
                // For SQLite compatibility, since modifying columns can be tricky, 
                // we'll just add new foreign keys and maybe rename the old one
                $table->renameColumn('created_by', 'legacy_created_by');
            }
            
            $table->unsignedBigInteger('user_id')->nullable()->after('report_date');
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();

            $table->unsignedBigInteger('updated_by_user_id')->nullable()->after('user_id');
            $table->foreign('updated_by_user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });

        Schema::table('daily_reports', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
            
            $table->dropForeign(['updated_by_user_id']);
            $table->dropColumn('updated_by_user_id');
            
            if (Schema::hasColumn('daily_reports', 'legacy_created_by')) {
                $table->renameColumn('legacy_created_by', 'created_by');
            }
        });
    }
};
