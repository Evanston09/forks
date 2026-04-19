export type GameState = {
    stage: 'pregame' | 'running' | 'postgame';
    auth_open: boolean;
    ffa: boolean;
    start: string;
};

export type AdminGameState = GameState & {
    seniors_only_signup: boolean;
    show_real_names: boolean;
};
