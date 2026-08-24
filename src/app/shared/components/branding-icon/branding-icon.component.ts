import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-branding-icon',
    template: `
        <svg
            class="branding-icon"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <!-- Outer rune ring -->
            <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
                opacity="0.3"
            />
            <!-- Rune inner diamond -->
            <path
                d="M24 8 L32 24 L24 40 L16 24 Z"
                stroke="var(--mat-sys-tertiary)"
                stroke-width="1.5"
                fill="none"
            />
            <!-- Dragon head silhouette -->
            <path
                d="M24 14 C28 14 32 18 33 22 C34 26 32 30 28 32 L24 34 L20 32 C16 30 14 26 15 22 C16 18 20 14 24 14Z"
                stroke="var(--mat-sys-primary)"
                stroke-width="1.5"
                fill="var(--mat-sys-primary)"
                fill-opacity="0.15"
            />
            <!-- Dragon eyes -->
            <circle cx="21" cy="22" r="1.5" fill="var(--mat-sys-tertiary)" />
            <circle cx="27" cy="22" r="1.5" fill="var(--mat-sys-tertiary)" />
            <!-- Central rune line -->
            <line
                x1="24"
                y1="14"
                x2="24"
                y2="34"
                stroke="var(--mat-sys-tertiary)"
                stroke-width="1"
                opacity="0.5"
            />
            <!-- Cross rune line -->
            <line
                x1="16"
                y1="22"
                x2="32"
                y2="22"
                stroke="var(--mat-sys-tertiary)"
                stroke-width="1"
                opacity="0.3"
            />
        </svg>
    `,
    styles: [
        `
            .branding-icon {
                width: 40px;
                height: 40px;
                display: inline-block;
                vertical-align: middle;
            }
        `,
    ],
})
export class BrandingIconComponent {}
