import { Component, OnInit } from '@angular/core';
import { PagedSearch } from 'src/app/types/general/paged-search';
import { Game } from 'src/app/types/game/game';
import { SnackbarService } from 'src/app/service/snackbar/snackbar.service';
import { GameService } from 'src/app/service/game/game.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
    gameSelected: string = '';
    pageSize = 0;
    enableShowMoreBtn: boolean = true;

    gamePagedSearch: PagedSearch<Game> | null = null;

    constructor(
        private snackBar: SnackbarService,
        private gameService: GameService
    ) {}

    ngOnInit(): void {
        this.showMore();
    }

    async getGames(listSize: number): Promise<PagedSearch<Game> | null> {
        let result: PagedSearch<Game> | null = null;

        try {
            result = await this.gameService.getGames('desc', listSize, 1);
        } catch (error) {
            this.snackBar.addError(
                'Something went wrong while attempting to get the game list.'
            );
            console.log(`Error: ${error}`);
        }

        return result;
    }

    async showMore() {
        this.pageSize = this.pageSize + 10;

        this.gamePagedSearch = await this.getGames(this.pageSize);

        if (
            this.gamePagedSearch != null &&
            this.pageSize >= this.gamePagedSearch.totalResults
        ) {
            this.enableShowMoreBtn = false;
        }
    }

    async setGame(gameId: string) {
        this.gameSelected = gameId;
    }

    gameCreated(gameName: string): void {
        this.showMore();

        if (gameName != null && gameName != '') {
            let gameId = this.gamePagedSearch?.list[0].id ?? '';
            this.gameSelected = gameId;
            console.log('Game Selected: ' + gameId);
        }
    }
}
