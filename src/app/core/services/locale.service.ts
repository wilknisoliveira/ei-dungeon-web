import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE,
    LANGUAGE_STORAGE_KEY,
} from '../config/supported-languages';
import { LanguageConfiguration } from '../models/language.model';

@Injectable({
    providedIn: 'root',
})
export class LocaleService {
    constructor(@Inject(DOCUMENT) private document: Document) {}

    getSupportedLanguages(): LanguageConfiguration[] {
        return SUPPORTED_LANGUAGES;
    }

    getCurrentLanguage(): string {
        const pathSegments = this.document.location.pathname
            .split('/')
            .filter(Boolean);
        const firstSegment = pathSegments[0];

        if (this.isValidLanguage(firstSegment)) {
            return firstSegment;
        }

        return DEFAULT_LANGUAGE;
    }

    resolveLanguage(browserLang: string, stored: string): string {
        if (stored && this.isValidLanguage(stored)) {
            return stored;
        }

        if (browserLang) {
            const resolved = this.mapRegionalVariant(browserLang);
            if (resolved && this.isValidLanguage(resolved)) {
                return resolved;
            }
        }

        return DEFAULT_LANGUAGE;
    }

    getBrowserLanguage(): string {
        const languages = navigator.languages || [navigator.language];

        for (const lang of languages) {
            const resolved = this.mapRegionalVariant(lang);
            if (resolved && this.isValidLanguage(resolved)) {
                return resolved;
            }
        }

        return '';
    }

    savePreference(lang: string): void {
        try {
            if (this.isValidLanguage(lang)) {
                localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
            }
        } catch (e) {
            console.warn('Failed to save language preference:', e);
        }
    }

    getStoredPreference(): string {
        try {
            const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
            if (stored && this.isValidLanguage(stored)) {
                return stored;
            }
        } catch (e) {
            console.warn('Failed to read language preference:', e);
        }
        return '';
    }

    private isValidLanguage(code: string): boolean {
        return SUPPORTED_LANGUAGES.some((lang) => lang.code === code);
    }

    private mapRegionalVariant(langCode: string): string {
        const baseCode = langCode.split('-')[0].toLowerCase();

        const exactMatch = SUPPORTED_LANGUAGES.find(
            (lang) => lang.code.toLowerCase() === langCode.toLowerCase()
        );
        if (exactMatch) {
            return exactMatch.code;
        }

        const baseMatch = SUPPORTED_LANGUAGES.find(
            (lang) => lang.code.split('-')[0].toLowerCase() === baseCode
        );
        if (baseMatch) {
            return baseMatch.code;
        }

        return '';
    }
}
