import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { OverlayContainer } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';

@Component({
    selector: 'app-theme-toggle',
    templateUrl: './theme-toggle.component.html',
    styleUrls: ['./theme-toggle.component.scss'],
})
export class ThemeToggleComponent implements OnInit {
    switchTheme = new FormControl(true);
    darkClass = 'theme-dark';
    lightClass = 'theme-light';

    constructor(
        private overlay: OverlayContainer,
        @Inject(DOCUMENT) private document: Document,
    ) {}

    ngOnInit(): void {
        this.document.body.classList.remove(this.lightClass);
        this.document.body.classList.add(this.darkClass);

        this.switchTheme.valueChanges.subscribe((isDarkMode) => {
            if (isDarkMode) {
                this.document.body.classList.add(this.darkClass);
                this.document.body.classList.remove(this.lightClass);
                this.overlay
                    .getContainerElement()
                    .classList.add(this.darkClass);
            } else {
                this.document.body.classList.add(this.lightClass);
                this.document.body.classList.remove(this.darkClass);
                this.overlay
                    .getContainerElement()
                    .classList.remove(this.darkClass);
            }
        });
    }

    toggleTheme(): void {
        this.switchTheme.setValue(!this.switchTheme.value);
    }
}
