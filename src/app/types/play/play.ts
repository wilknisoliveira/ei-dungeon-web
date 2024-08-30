import { Player } from './player';

export interface Play {
    id: string;
    playerDtoResponse: Player;
    prompt: string;
    createdAt: Date;
}
