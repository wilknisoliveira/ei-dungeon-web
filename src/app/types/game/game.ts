export interface Game {
    id: string;
    name: string;
    ownerUserId: string;
    gameLanguage: string;
    gameStatus: string;
    lastPlayedAt: Date | null;
}
