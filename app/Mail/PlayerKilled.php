<?php

namespace App\Mail;

use App\Models\Kill;
use Carbon\CarbonInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PlayerKilled extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Kill $kill,
        public string $approveUrl,
        public string $contestUrl,
        public CarbonInterface $expiresAt,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Action Needed: Verify Your Reported Elimination (NCSSM Forks)',
        );
    }

    public function content(): Content
    {
        $this->kill->loadMissing([
            'killer:id,name',
            'victim:id,name',
        ]);

        return new Content(
            markdown: 'mail.player-killed',
            with: [
                'killerName' => $this->kill->killer->name,
                'victimName' => $this->kill->victim->name,
                'submittedAtFormatted' => $this->kill->created_at->timezone(config('app.timezone'))->format('M j, Y \\a\\t g:i A T'),
                'expiresAtFormatted' => $this->expiresAt->timezone(config('app.timezone'))->format('M j, Y \\a\\t g:i A T'),
                'approveUrl' => $this->approveUrl,
                'contestUrl' => $this->contestUrl,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
