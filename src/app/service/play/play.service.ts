import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { PagedSearch } from 'src/app/types/general/paged-search';
import { NewPlay } from 'src/app/types/play/new-play';
import { Play } from 'src/app/types/play/play';
import { StreamPlay } from 'src/app/types/play/stream-play';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';

@Injectable({
    providedIn: 'root',
})
export class PlayService {
    private baseUrl = environment.api;

    constructor(
        private http: HttpClient,
        private authService: AuthService,
    ) {}

    async getPlays(
        gameId: string,
        pageSize: number,
    ): Promise<PagedSearch<Play>> {
        const playPaged$ = this.http.get<PagedSearch<Play>>(
            `${this.baseUrl}/api/Play/${gameId}/${pageSize}`,
        );

        return lastValueFrom(playPaged$);
    }

    async streamNewPlay(
        newPlay: NewPlay,
        onChunk: (chunk: StreamPlay) => void,
    ): Promise<void> {
        const token = this.authService.getAuthToken();
        if (!token) {
            return Promise.reject(new Error('No token found'));
        }

        const response = await fetch(`${this.baseUrl}/api/Play`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newPlay),
        });

        if (!response.body) {
            return Promise.reject(new Error('No body received'));
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            buffer += decoder.decode(value, { stream: true });

            const chunks = buffer.split('\n');

            for (let chunk of chunks) {
                if (!chunk.trim()) continue;

                if (!chunk.endsWith(']')) {
                    chunk += ']';
                }

                const streamPlay: StreamPlay[] = JSON.parse(chunk);
                onChunk(streamPlay[streamPlay.length - 1]);
            }
        }
    }
}
