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
    pageSize = 10;

    gamePagedSearch: PagedSearch<Game> | null = null;

    constructor(
        private snackBar: SnackbarService,
        private gameService: GameService
    ) {}

    async ngOnInit(): Promise<void> {
        this.gamePagedSearch = await this.getGames(10);
    }

    async getGames(listSize: number): Promise<PagedSearch<Game> | null> {
        let result: PagedSearch<Game> | null = null;

        try {
            result = await this.gameService.getGames('desc', listSize, 1);
        } catch (error) {
            this.snackBar.addError(
                'Something went wrong while attempting to get the game list.'
            );
            console.log(`Login error: ${error}`);
        }

        return result;
    }

    showMore() {
        this.pageSize = this.pageSize + 10;
    }

    newRole() {}
}
