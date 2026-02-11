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

    racialBonus: { name: string; bonus: Record<string, number> }[] = [
        {
            name: 'Human',
            bonus: {
                Strength: 1,
                Dexterity: 1,
                Intelligence: 1,
                Constitution: 1,
                Charisma: 1,
                Wisdom: 1,
            },
        },
        { name: 'Elf', bonus: { Dexterity: 2 } },
        { name: 'Dwarf', bonus: { Constitution: 2 } },
        { name: 'HalfElf', bonus: { Intelligence: 1, Charisma: 2, Wisdom: 1 } },
        { name: 'Halfling', bonus: { Dexterity: 2 } },
        { name: 'Tiefling', bonus: { Intelligence: 1, Charisma: 2 } },
        { name: 'Dragonborn', bonus: { Strength: 2, Charisma: 1 } },
        { name: 'HalfOrc', bonus: { Strength: 2, Constitution: 1 } },
        { name: 'Gnome', bonus: { Intelligence: 2 } },
    ];

    loading: boolean = false;

    minSkillPoints: number = 8;
    maxSkillPointsToDistribute: number = 30;
    currentSkillPointsDistributed: number = 0;

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
                Strength: [8, Validators.required],
                Dexterity: [8, Validators.required],
                Constitution: [8, Validators.required],
                Intelligence: [8, Validators.required],
                Wisdom: [8, Validators.required],
                Charisma: [8, Validators.required],
            }),
        });

        const skillsGroup = this.gameFormGroup.get('skillsGroup') as FormGroup;
        skillsGroup.valueChanges.subscribe(() => {
            this.sumSkillPoints();
        });

        this.sumSkillPoints();
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
                this.snackBar.addSuccess(`Game '${newGame.name}' created!`);
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

    sumSkillPoints(): void {
        const skillsGroup = this.gameFormGroup.get('skillsGroup') as FormGroup;
        let sum = 0;

        Object.keys(skillsGroup.controls).forEach((skillName) => {
            const skill = skillsGroup.get(skillName);
            sum += (skill?.value || 0) - this.minSkillPoints;
        });

        this.currentSkillPointsDistributed = sum;
    }

    getRacialBonusByRaceAndSkill(race: string, skill: string): number {
        const racialBonus = this.racialBonus.find(
            (bonus) => bonus.name === race,
        );

        return racialBonus?.bonus[skill] || 0;
    }
}
