export type GameState = {
    stage: 'pregame' | 'running' | 'postgame';
    ffa: boolean;
    start: string;
};

export type AdminGameState = GameState & {
    public_signup_open: boolean;
    seniors_only_signup: boolean;
    show_real_names: boolean;
    rules_pdf_uploaded: boolean;
};
