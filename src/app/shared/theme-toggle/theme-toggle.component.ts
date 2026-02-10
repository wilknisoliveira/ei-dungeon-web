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
    // Dark theme is the default
    isDarkMode = new FormControl(true);
    darkTheme = 'theme-dark';
    lightTheme = 'theme-light';

    constructor(
        private overlay: OverlayContainer,
        @Inject(DOCUMENT) private document: Document,
    ) {}

    ngOnInit(): void {
        const savedTheme = localStorage.getItem('app-theme') ?? this.darkTheme;
        if (savedTheme === this.lightTheme) {
            this.isDarkMode.setValue(false);
        }

        this.setTheme(savedTheme === this.darkTheme);

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
            isDarkMode ? this.darkTheme : this.lightTheme,
        );

        if (isDarkMode) {
            this.document.body.classList.remove(this.lightTheme);
            this.overlay
                .getContainerElement()
                .classList.remove(this.lightTheme);
        } else {
            this.document.body.classList.add(this.lightTheme);
            this.overlay.getContainerElement().classList.add(this.lightTheme);
        }
    }
}
