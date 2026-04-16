<?php

namespace App\Enums;

enum KillStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Denied = 'denied';
    case Contested = 'contested';
}
