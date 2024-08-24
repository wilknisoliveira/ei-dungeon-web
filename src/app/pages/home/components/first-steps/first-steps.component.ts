import { Component } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';

@Component({
    selector: 'app-first-steps',
    templateUrl: './first-steps.component.html',
    styleUrls: ['./first-steps.component.scss'],
})
export class FirstStepsComponent {
    isLinear = true;
    numberOfArtificialPlayers: number = 2;
    characterDescription: string = '';

    gameSystemFormGroup: FormGroup;
    numberOfArtificialPlayersFormGroup: FormGroup;
    characterDescriptionFormGroup: FormGroup;

    gameSystems: { value: string; name: string }[] = [
        { value: 'DeD', name: 'Dungeons & Dragons (D&D)' },
        { value: 'Pathfinder', name: 'Pathfinder' },
        { value: 'CoC', name: 'Call of Cthulhu' },
        { value: 'Shadowrun', name: 'Shadowrun' },
        {
            value: 'GURPS',
            name: 'GURPS (Generic Universal RolePlaying System)',
        },
    ];

    constructor(private _formBuilder: FormBuilder) {
        this.gameSystemFormGroup = this._formBuilder.group({
            gameSystemControl: ['', Validators.required],
        });

        this.numberOfArtificialPlayersFormGroup = this._formBuilder.group({
            numberOfArtificialPlayersControl: [0, Validators.required],
        });

        this.characterDescriptionFormGroup = this._formBuilder.group({
            characterDescriptionControl: ['', Validators.required],
        });
    }

    submit() {}
}
