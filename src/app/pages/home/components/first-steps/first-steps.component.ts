import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm } from '@angular/forms';
import { GameService } from 'src/app/service/game/game.service';
import { SnackbarService } from 'src/app/service/snackbar/snackbar.service';
import { NewGame } from 'src/app/types/game/new-game';

@Component({
    selector: 'app-first-steps',
    templateUrl: './first-steps.component.html',
    styleUrls: ['./first-steps.component.scss'],
})
export class FirstStepsComponent {
    @Output() gameCreated = new EventEmitter<string>();

    @ViewChild('gameNgForm') gameNgForm!: NgForm;

    gameFormGroup: FormGroup;
    races: { name: string; value: string }[] = [
        { name: 'Human', value: 'Human' },
        { name: 'Elf', value: 'Elf' },
        { name: 'Dwarf', value: 'Dwarf' },
        { name: 'HalfElf', value: 'HalfElf' },
        { name: 'Halfling', value: 'Halfling' },
        { name: 'Tiefling', value: 'Tiefling' },
        { name: 'Dragonborn', value: 'Dragonborn' },
        { name: 'HalfOrc', value: 'HalfOrc' },
        { name: 'Gnome', value: 'Gnome' },
    ];

    skills: { name: string; value: string }[] = [
        { name: 'Strength', value: 'Strength' },
        { name: 'Dexterity', value: 'Dexterity' },
        { name: 'Intelligence', value: 'Intelligence' },
        { name: 'Constitution', value: 'Constitution' },
        { name: 'Charisma', value: 'Charisma' },
        { name: 'Wisdom', value: 'Wisdom' },
    ];

    loading: boolean = false;

    constructor(
        private _formBuilder: FormBuilder,
        private gameService: GameService,
        private snackBar: SnackbarService,
    ) {
        this.gameFormGroup = this._formBuilder.group({
            gameNameControl: ['', Validators.required],
            characterNameControl: ['', Validators.required],
            characterDescriptionControl: ['', Validators.required],
            characterRaceControl: ['', Validators.required],
            skillsGroup: this._formBuilder.group({
                Strength: [12, Validators.required],
                Dexterity: [12, Validators.required],
                Constitution: [12, Validators.required],
                Intelligence: [12, Validators.required],
                Wisdom: [12, Validators.required],
                Charisma: [12, Validators.required],
            }),
        });
    }

    onSubmit(): void {
        this.loading = true;
        let newGame: NewGame = {
            characterDescription: this.gameFormGroup.get(
                'characterDescriptionControl',
            )?.value,
            characterName: this.gameFormGroup.get('characterNameControl')
                ?.value,
            name: this.gameFormGroup.get('gameNameControl')?.value,
            race: this.gameFormGroup.get('characterRaceControl')?.value,
            skills: {
                Strength: this.gameFormGroup.get('skillsGroup.Strength')?.value,
                Dexterity: this.gameFormGroup.get('skillsGroup.Dexterity')
                    ?.value,
                Constitution: this.gameFormGroup.get('skillsGroup.Constitution')
                    ?.value,
                Intelligence: this.gameFormGroup.get('skillsGroup.Intelligence')
                    ?.value,
                Wisdom: this.gameFormGroup.get('skillsGroup.Wisdom')?.value,
                Charisma: this.gameFormGroup.get('skillsGroup.Charisma')?.value,
            },
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
                    'Something went wrong while attempting to create the game. Verify with the admin if you have the permissions.',
                );
            },
        });
    }
}
