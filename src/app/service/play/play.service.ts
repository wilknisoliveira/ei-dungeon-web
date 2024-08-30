import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { PagedSearch } from 'src/app/types/general/paged-search';
import { Play } from 'src/app/types/play/play';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class PlayService {
    private baseUrl = environment.api;

    constructor(private http: HttpClient) {}

    async getPlays(
        gameId: string,
        pageSize: number
    ): Promise<PagedSearch<Play>> {
        const playPaged$ = this.http.get<PagedSearch<Play>>(
            `${this.baseUrl}/api/Play/${gameId}/${pageSize}`
        );

        return lastValueFrom(playPaged$);
    }
}
