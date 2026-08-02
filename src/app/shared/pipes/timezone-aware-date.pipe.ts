import { Pipe, PipeTransform, Inject, LOCALE_ID } from '@angular/core';
import { TimezoneService } from '../../core/services/timezone.service';

@Pipe({
    standalone: false,
    name: 'tzDate',
    pure: true,
})
export class TimezoneAwareDatePipe implements PipeTransform {
    constructor(
        @Inject(LOCALE_ID) private locale: string,
        private timezoneService: TimezoneService
    ) {}

    transform(
        value: Date | string | number,
        options: Intl.DateTimeFormatOptions = {
            dateStyle: 'medium',
            timeStyle: 'short',
        },
        timezone?: string
    ): string {
        if (!value) {
            return '';
        }

        const date =
            typeof value === 'string' || typeof value === 'number'
                ? new Date(value)
                : value;

        if (isNaN(date.getTime())) {
            return '';
        }

        const tz = timezone || this.timezoneService.getUserTimezone();

        const formatOptions: Intl.DateTimeFormatOptions = {
            ...options,
            timeZone: tz,
        };

        try {
            return new Intl.DateTimeFormat(this.locale, formatOptions).format(
                date
            );
        } catch (e) {
            console.warn('Failed to format date with timezone:', e);
            return date.toLocaleString();
        }
    }
}
