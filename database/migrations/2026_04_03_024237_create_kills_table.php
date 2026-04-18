<?php

use App\Enums\KillStatus;
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
        Schema::create('kills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('killer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('victim_id')->constrained('users')->cascadeOnDelete();
            $table->enum('status', array_column(KillStatus::cases(), 'value'))
                ->default(KillStatus::Pending->value);
            $table->boolean('is_ffa')->default(false);
            $table->text('contest_reason')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('notification_sent_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->string('resolution_source')->nullable();
            $table->timestamps();

            $table->index(['status', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kills');
    }
};
