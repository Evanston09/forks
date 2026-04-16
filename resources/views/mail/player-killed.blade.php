<x-mail::message>
# Verify this kill report

Hi {{ $victimName }},

{{ $killerName }} reported that they eliminated you.

Please confirm whether this report is valid. If you approve it, your elimination can be processed immediately. If the report is wrong, use the contest link and tell us what happened.

<x-mail::panel>
Reported by: {{ $killerName }}

Submitted: {{ $submittedAtFormatted ?? 'Recently' }}

Response deadline: {{ $expiresAtFormatted }}
</x-mail::panel>

<x-mail::button :url="$reviewUrl">
View Report
</x-mail::button>

If you do nothing, this report will auto-approve at {{ $expiresAtFormatted }}.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
