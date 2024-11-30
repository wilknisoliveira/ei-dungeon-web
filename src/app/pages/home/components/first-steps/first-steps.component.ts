import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GameService } from 'src/app/service/game/game.service';
import { SnackbarService } from 'src/app/service/snackbar/snackbar.service';
import { LoadingComponent } from 'src/app/shared/loading/loading.component';
import { NewGame } from 'src/app/types/game/new-game';

@Component({
    selector: 'app-first-steps',
    templateUrl: './first-steps.component.html',
    styleUrls: ['./first-steps.component.scss'],
})
export class FirstStepsComponent {
    @Output() gameCreated = new EventEmitter<string>();

    gameSystemFormGroup: FormGroup;
    numberOfArtificialPlayersFormGroup: FormGroup;
    characterDescriptionFormGroup: FormGroup;
    characterNameFormGroup: FormGroup;
    gameNameFormGroup: FormGroup;

    gameSystems: { value: string; name: string }[] = [
        { value: 'Dungeons & Dragons (D&D)', name: 'Dungeons & Dragons (D&D)' },
        { value: 'Pathfinder', name: 'Pathfinder' },
        { value: 'Call of Cthulhu', name: 'Call of Cthulhu' },
        { value: 'Shadowrun', name: 'Shadowrun' },
        {
            value: 'GURPS (Generic Universal RolePlaying System)',
            name: 'GURPS (Generic Universal RolePlaying System)',
        },
    ];

    loading: boolean = false;

    constructor(
        private _formBuilder: FormBuilder,
        private gameService: GameService,
        private snackBar: SnackbarService
    ) {
        this.gameSystemFormGroup = this._formBuilder.group({
            gameSystemControl: ['', Validators.required],
        });

        this.numberOfArtificialPlayersFormGroup = this._formBuilder.group({
            numberOfArtificialPlayersControl: [0, Validators.required],
        });

        this.characterNameFormGroup = this._formBuilder.group({
            characterNameControl: ['', Validators.required],
        });

        this.characterDescriptionFormGroup = this._formBuilder.group({
            characterDescriptionControl: ['', Validators.required],
        });

        this.gameNameFormGroup = this._formBuilder.group({
            gameNameControl: ['', Validators.required],
        });
    }

    submit(): void {
        this.loading = true;
        let newGame: NewGame = {
            systemGame:
                this.gameSystemFormGroup.get('gameSystemControl')?.value[0],
            numberOfArtificialPlayers:
                this.numberOfArtificialPlayersFormGroup.get(
                    'numberOfArtificialPlayersControl'
                )?.value,
            characterName: this.characterNameFormGroup.get(
                'characterNameControl'
            )?.value,
            characterDescription: this.characterDescriptionFormGroup.get(
                'characterDescriptionControl'
            )?.value,
            name: this.gameNameFormGroup.get('gameNameControl')?.value,
        };

        this.gameService.newGame(newGame).subscribe({
            next: () => {
                this.gameCreated.emit(newGame.name);
                this.loading = false;
                this.snackBar.addSuccess(`Game ${newGame.name} created!`);
            },
            error: (error: HttpErrorResponse) => {
                //TODO: Exibir erro e tratar
                this.loading = false;
                this.snackBar.addError(
                    'Something went wrong while attempting to create the game. Verify with the admin if you have the permissions.'
                );
            },
        });
    }
}
