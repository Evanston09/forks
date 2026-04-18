<x-mail::message>
# Kill Claim Pending Verification

{{ $killerName }} reported eliminating you in NCSSM Forks.

- Submitted: {{ $submittedAtFormatted }}
- Response deadline: {{ $expiresAtFormatted }}

Open the game to approve or contest this claim:

<x-mail::button :url="$reviewUrl">
Review Claim
</x-mail::button>

If you do nothing, the claim will auto-approve after the response deadline.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
