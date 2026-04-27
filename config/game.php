<?php

return [
    'admin_emails' => array_filter(explode(',', env('ADMIN_EMAILS', ''))),
    'enforce_signup_restrictions' => env(
        'GAME_ENFORCE_SIGNUP_RESTRICTIONS',
        in_array(env('APP_ENV', 'production'), ['production', 'testing']),
    ),
    'start' => env('GAME_START', '2026-04-13T00:00:00'),
];
