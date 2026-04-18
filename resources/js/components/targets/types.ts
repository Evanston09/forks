export type Target = {
    id: number;
    name: string;
    nickname: string | null;
};

export type ClaimParty = {
    id: number;
    name: string;
    nickname: string | null;
};

export type KillClaim = {
    id: number;
    status: 'pending' | 'contested' | 'approved' | 'denied';
    contest_reason: string | null;
    is_ffa: boolean;
    created_at: string;
    expires_at: string | null;
    notification_sent_at: string | null;
    resolved_at: string | null;
    resolution_source: string | null;
    killer?: ClaimParty;
    victim?: ClaimParty;
};

export type AlivePlayer = {
    id: number;
    name: string;
    nickname: string | null;
};
