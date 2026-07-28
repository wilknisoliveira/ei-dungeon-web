import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MatSelectChange } from '@angular/material/select';
import { LocaleService } from '../../../core/services/locale.service';
import { LanguageConfiguration } from '../../../core/models/language.model';

@Component({
    selector: 'app-language-selector',
    templateUrl: './language-selector.component.html',
    styleUrls: ['./language-selector.component.scss'],
})
export class LanguageSelectorComponent implements OnInit {
    currentLang = '';
    languages: LanguageConfiguration[] = [];

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private localeService: LocaleService
    ) {}

    ngOnInit(): void {
        this.languages = this.localeService.getSupportedLanguages();
        this.currentLang = this.localeService.getCurrentLanguage();
    }

    switchLanguage(event: MatSelectChange): void {
        const newLang = event.value;

        if (newLang === this.currentLang) {
            return;
        }

        this.localeService.savePreference(newLang);

        const currentPath = this.document.location.pathname;
        const segments = currentPath.split('/').filter(Boolean);

        if (segments.length > 0 && this.isValidLanguage(segments[0])) {
            segments.shift();
        }

        const remainingPath =
            segments.length > 0 ? '/' + segments.join('/') : '';
        const newPath = `/${newLang}${remainingPath}`;

        this.document.location.href = newPath;
    }

    private isValidLanguage(code: string): boolean {
        return this.languages.some((lang) => lang.code === code);
    }
}
