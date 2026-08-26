import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { PagedSearch } from 'src/app/types/general/paged-search';
import { Game } from 'src/app/types/game/game';
import { SnackbarService } from 'src/app/service/snackbar/snackbar.service';
import { GameService } from 'src/app/service/game/game.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AuthService } from 'src/app/service/auth/auth.service';
import { SmallLoadingComponent } from 'src/app/shared/small-loading/small-loading.component';
import { LanguageSelectorComponent } from 'src/app/shared/components/language-selector/language-selector.component';
import { ThemeToggleComponent } from 'src/app/shared/theme-toggle/theme-toggle.component';
import { ChatComponent } from './components/chat/chat.component';
import { FirstStepsComponent } from './components/first-steps/first-steps.component';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatDialogModule,
        MatSidenavModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        SmallLoadingComponent,
        LanguageSelectorComponent,
        ThemeToggleComponent,
        ChatComponent,
        FirstStepsComponent,
    ],
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
    gameSelected: string = '';
    pageSize = 0;
    enableShowMoreBtn: boolean = true;
    isLoadingGames: boolean = false;
    renamingGameId: string | null = null;
    renamingGameName: string = '';

    gamePagedSearch: PagedSearch<Game> | null = null;

    constructor(
        public dialog: MatDialog,
        private snackBar: SnackbarService,
        private gameService: GameService,
        private router: Router,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
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
                $localize`Something went wrong while attempting to get the game list.`,
            );
        }

        return result;
    }

    async showMore() {
        this.isLoadingGames = true;
        this.pageSize = this.pageSize + 10;

        this.gamePagedSearch = await this.getGames(this.pageSize);

        if (
            this.gamePagedSearch &&
            this.pageSize >= this.gamePagedSearch.totalResults
        ) {
            this.enableShowMoreBtn = false;
        }

        this.isLoadingGames = false;
        this.cdr.detectChanges();
    }

    async setGame(gameId: string) {
        this.gameSelected = gameId;
    }

    async gameCreated(gameName: string): Promise<void> {
        await this.showMore();

        if (gameName) {
            this.gameSelected =
                this.gamePagedSearch?.items.find(
                    (game) => game.name === gameName,
                )?.id ??
                this.gamePagedSearch?.items[0].id ??
                '';
        }
    }

    async deleteGame(gameId: string): Promise<void> {
        this.gameService.deleteGame(gameId).subscribe({
            next: () => {
                if (this.gameSelected === gameId) {
                    this.gameSelected = '';
                }

                this.gamePagedSearch?.items.splice(
                    this.gamePagedSearch?.items.findIndex(
                        (game) => game.id === gameId,
                    ),
                    1,
                );

                this.snackBar.addSuccess($localize`Game deleted successfully.`);
            },
            error: (error) => {
                this.snackBar.addError(
                    $localize`Something went wrong while attempting to delete the game.`,
                );
                console.log(`Error: ${error}`);
            },
        });
    }

    openDeleteDialog(gameId: string, gameName: string): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '250px',
            data: $localize`Are you sure you want to delete the game '${gameName}'?`,
        });

        dialogRef.afterClosed().subscribe((result: boolean): void => {
            if (result) {
                this.deleteGame(gameId);
            }
        });
    }

    startRename(gameId: string, currentName: string): void {
        this.renamingGameId = gameId;
        this.renamingGameName = currentName;
    }

    confirmRename(): void {
        if (!this.renamingGameId) return;

        const gameId = this.renamingGameId;
        const newName = this.renamingGameName.trim();

        this.cancelRename();

        if (!newName || newName.length < 2 || newName.length > 20) return;

        const game = this.gamePagedSearch?.items.find((g) => g.id === gameId);
        if (game && newName === game.name) return;

        this.gameService.patchGame(gameId, { name: newName }).subscribe({
            next: (updatedGame) => {
                if (game) {
                    game.name = updatedGame.name;
                }
                this.snackBar.addSuccess($localize`Game renamed successfully.`);
            },
            error: (error) => {
                this.snackBar.addError(
                    $localize`Something went wrong while attempting to rename the game.`,
                );
                console.log(`Error: ${error}`);
            },
        });
    }

    cancelRename(): void {
        this.renamingGameId = null;
        this.renamingGameName = '';
    }

    onRenameKeydown(event: KeyboardEvent, gameId: string): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.confirmRename();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            this.cancelRename();
        }
    }

    async logout(): Promise<void> {
        await this.authService.serverLogout();
        this.router.navigate(['login']);
    }

    navigateToSettings(): void {
        this.router.navigate(['settings']);
    }

    onGamePlayed(gameId: string): void {
        if (!this.gamePagedSearch?.items) return;

        const currentIndex = this.gamePagedSearch.items.findIndex(
            (game) => game.id === gameId,
        );

        if (currentIndex > 0) {
            const [game] = this.gamePagedSearch.items.splice(currentIndex, 1);
            this.gamePagedSearch.items.unshift(game);
        }
    }
}
