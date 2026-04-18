export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    nickname?: string | null;
    phone?: string | null;
    dorm_location?: string | null;
    profile_completed?: boolean;
    alive?: boolean;
    is_admin?: boolean;
    current_target_id?: number | null;
    total_kills?: number;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
