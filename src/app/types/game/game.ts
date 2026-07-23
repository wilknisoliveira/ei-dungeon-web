export interface Game {
    id: string;
    name: string;
    ownerUserId: string;
    gameStatus: string;
    lastPlayedAt: Date | null;
}
