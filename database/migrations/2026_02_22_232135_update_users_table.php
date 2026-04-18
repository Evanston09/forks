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
            $table->string('google_id')->unique()->after('id');

            // Profile fields
            $table->string('nickname')->nullable()->after('email');
            $table->string('phone')->nullable()->after('nickname');
            $table->string('dorm_location')->nullable()->after('phone');
            $table->boolean('profile_completed')->default(false)->after('dorm_location');

            // Admin & game state
            $table->boolean('is_admin')->default(false)->after('profile_completed');
            $table->boolean('alive')->default(true)->after('is_admin');
            $table->foreignId('current_target_id')->nullable()->after('alive')->constrained('users')->nullOnDelete();
            $table->unsignedInteger('total_kills')->default(0)->after('current_target_id');
            $table->foreignId('killed_by')->nullable()->after('total_kills')->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['current_target_id']);
            $table->dropForeign(['killed_by']);
            $table->dropColumn([
                'google_id',
                'nickname',
                'phone',
                'dorm_location',
                'profile_completed',
                'is_admin',
                'alive',
                'current_target_id',
                'total_kills',
                'killed_by',
            ]);
        });
    }
};
