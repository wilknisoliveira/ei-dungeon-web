import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { Game } from 'src/app/types/game/game';
import { NewGame } from 'src/app/types/game/new-game';
import { PagedSearch } from 'src/app/types/general/paged-search';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    private baseUrl = environment.api;

    constructor(private http: HttpClient) {}

    async getGames(
        sortDirection: string,
        pageSize: number,
        page: number
    ): Promise<PagedSearch<Game>> {
        const gamesPaged$ = this.http.get<PagedSearch<Game>>(
            `${this.baseUrl}/api/Game/${sortDirection}/${pageSize}/${page}`
        );

        return lastValueFrom(gamesPaged$);
    }

    newGame(newGame: NewGame): Observable<Game> {
        return this.http.post<Game>(`${this.baseUrl}/api/Game`, newGame);
    }
}
