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
    isDarkMode = new FormControl(true);
    darkClass = 'theme-dark';
    lightClass = 'theme-light';

    constructor(
        private overlay: OverlayContainer,
        @Inject(DOCUMENT) private document: Document,
    ) {}

    ngOnInit(): void {
        const savedTheme = localStorage.getItem('app-theme') ?? this.darkClass;
        if (savedTheme === this.lightClass) {
            this.isDarkMode.setValue(false);
        }

        this.setTheme(savedTheme === this.darkClass);

        this.isDarkMode.valueChanges.subscribe((isDarkMode) => {
            this.setTheme(isDarkMode ?? true);
        });
    }

    toggleTheme(): void {
        this.isDarkMode.setValue(!this.isDarkMode.value);
    }

    setTheme(isDarkMode: boolean): void {
        localStorage.setItem(
            'app-theme',
            isDarkMode ? this.darkClass : this.lightClass,
        );

        if (isDarkMode) {
            this.document.body.classList.add(this.darkClass);
            this.document.body.classList.remove(this.lightClass);
            this.overlay.getContainerElement().classList.add(this.darkClass);
            this.overlay
                .getContainerElement()
                .classList.remove(this.lightClass);
        } else {
            this.document.body.classList.add(this.lightClass);
            this.document.body.classList.remove(this.darkClass);
            this.overlay.getContainerElement().classList.add(this.lightClass);
            this.overlay.getContainerElement().classList.remove(this.darkClass);
        }
    }
}
