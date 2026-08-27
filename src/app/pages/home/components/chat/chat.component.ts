import { HttpErrorResponse } from '@angular/common/http';
import {
    AfterViewChecked,
    Component,
    ElementRef,
    Injector,
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewChild,
    afterNextRender,
    input,
    output,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { SmallLoadingComponent } from 'src/app/shared/small-loading/small-loading.component';
import { GameService } from 'src/app/service/game/game.service';
import { PlayService } from 'src/app/service/play/play.service';
import { SnackbarService } from 'src/app/service/snackbar/snackbar.service';
import { Game } from 'src/app/types/game/game';
import { PagedSearch } from 'src/app/types/general/paged-search';
import { NewPlay } from 'src/app/types/play/new-play';
import { Play } from 'src/app/types/play/play';
import { Player } from 'src/app/types/play/player';
import { StreamPlay } from 'src/app/types/play/stream-play';

/**
 * Number of extra animation frames the message list is kept pinned to the
 * bottom after a session is opened, so late layout cannot shift it away.
 */
const BOTTOM_PIN_FRAMES = 10;

@Component({
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        MatSelectModule,
        SmallLoadingComponent,
    ],
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnChanges, AfterViewChecked, OnDestroy {
    gameId = input<string>('');
    gamePlayed = output<string>();
    @ViewChild('messagesContainer') messagesContainer!: ElementRef;
    @ViewChild('textAreaContainer') textAreaContainer!: ElementRef;

    currentPage: number = 1;
    isLoadingMore = signal<boolean>(false);
    allPlaysLoaded = signal<boolean>(false);
    currentResponse = signal<Play | null>(null);
    playsPagedSearch = signal<PagedSearch<Play> | null>(null);
    newPlayFormGroup: FormGroup;
    forceScroll = signal<boolean>(false);
    loading = signal<boolean>(false);
    initialLoading = signal<boolean>(false);
    game = signal<Game | null>(null);
    streamedMessagesStartIndex = signal<number | null>(null);
    hasError = signal<boolean>(false);

    private bottomPinFrame: number | null = null;

    gameLanguages: { name: string; value: string; abbreviation: string }[] = [
        { name: $localize`Portuguese`, value: 'Portuguese', abbreviation: 'PT' },
        { name: $localize`English`, value: 'English', abbreviation: 'EN' },
        { name: $localize`Spanish`, value: 'Spanish', abbreviation: 'ES' },
    ];

    gameLanguageControl: FormGroup;

    get gameLanguageFormControl(): FormControl {
        return this.gameLanguageControl.get('gameLanguage') as FormControl;
    }

    get activePlaceholder(): string {
        return this.game()?.gameStatus !== 'PlayerDied'
            ? $localize`What do you do?`
            : $localize`This game has been finished, create a new one to start a new adventure!`;
    }

    get isDisabled(): boolean {
        return this.game()?.gameStatus === 'PlayerDied';
    }

    get currentGameLanguage(): string {
        return this.gameLanguageControl.get('gameLanguage')?.value || 'English';
    }

    onLanguageChange(): void {
        if (!this.game()) return;

        const newLanguage = this.gameLanguageControl.get('gameLanguage')?.value;
        this.gameService.patchGame(this.game()!.id, { gameLanguage: newLanguage }).subscribe({
            next: (updatedGame) => {
                this.game.set(updatedGame);
                this.snackBar.addSuccess($localize`Game language updated.`);
            },
            error: (error: HttpErrorResponse) => {
                this.snackBar.addError(
                    $localize`Something went wrong while attempting to update the game language.`,
                );
            },
        });
    }

    selectLanguage(value: string): void {
        this.gameLanguageControl.get('gameLanguage')?.setValue(value);
        this.onLanguageChange();
    }

    getDisplayName(play: Play): string {
        if (play.playerDtoResponse.type === 'RealPlayer') {
            return play.playerDtoResponse.name;
        }
        return $localize`Game Master`;
    }

    private readonly storagePrefix = 'game-cache-';

    private saveGameCache(gameId: string, data: Record<string, string>): void {
        sessionStorage.setItem(
            `${this.storagePrefix}${gameId}`,
            JSON.stringify(data),
        );
    }

    private getGameCache(gameId: string): Record<string, string> | null {
        const raw = sessionStorage.getItem(`${this.storagePrefix}${gameId}`);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    private removeGameCache(gameId: string): void {
        sessionStorage.removeItem(`${this.storagePrefix}${gameId}`);
    }

    constructor(
        private snackBar: SnackbarService,
        private playService: PlayService,
        private gameService: GameService,
        private _formBuilder: FormBuilder,
        private injector: Injector,
        private ngZone: NgZone,
    ) {
        this.newPlayFormGroup = this._formBuilder.group({
            newPlayControl: ['', Validators.required],
        });
        this.gameLanguageControl = this._formBuilder.group({
            gameLanguage: ['English', Validators.required],
        });
    }

    ngAfterViewChecked(): void {
        this.adjustAllReadyOnlyTextArea();
    }

    ngOnDestroy(): void {
        this.cancelBottomPin();
    }

    async ngOnChanges(changes: SimpleChanges): Promise<void> {
        if (!this.loading()) {
            this.initialLoading.set(true);
        }

        const previousGameId = changes['gameId']?.previousValue;
        if (previousGameId) {
            this.saveGameCache(previousGameId, {
                textbox:
                    this.newPlayFormGroup.get('newPlayControl')?.value ?? '',
            });
        }

        this.game.set(await this.gameService.getById(this.gameId()));

        if (this.game()) {
            this.gameLanguageControl.get('gameLanguage')?.setValue(this.game()!.gameLanguage);
        }

        if (changes['gameId']) {
            await this.loadInitialPlays();
            this.scrollToBottomAfterRender();

            const cache = this.getGameCache(this.gameId());
            this.newPlayFormGroup
                .get('newPlayControl')
                ?.setValue(cache?.['textbox'] ?? '');
        }

        this.initialLoading.set(false);
    }

    async ngOnInit(): Promise<void> {
        this.initialLoading.set(true);

        this.game.set(await this.gameService.getById(this.gameId()));

        if (this.game()) {
            this.gameLanguageControl.get('gameLanguage')?.setValue(this.game()!.gameLanguage);
        }

        await this.loadInitialPlays();
        this.scrollToBottomAfterRender();

        const cache = this.getGameCache(this.gameId());
        if (cache?.['textbox']) {
            this.newPlayFormGroup.get('newPlayControl')?.setValue(cache['textbox']);
        }

        this.initialLoading.set(false);
    }

    async getPlays(page: number): Promise<PagedSearch<Play> | null> {
        try {
            return await this.playService.getPlays(this.gameId(), 'desc', 20, page);
        } catch (error) {
            this.snackBar.addError(
                $localize`Something went wrong while attempting to get the play list.`,
            );
            console.log(`Error: ${error}`);
            return null;
        }
    }

    async loadInitialPlays(): Promise<void> {
        this.currentPage = 1;
        this.allPlaysLoaded.set(false);
        this.isLoadingMore.set(false);

        const result = await this.getPlays(1);
        if (result?.items) {
            result.items = result.items.reverse();
        }
        this.playsPagedSearch.set(result);
    }

    async loadMorePlays(): Promise<void> {
        if (this.isLoadingMore() || this.allPlaysLoaded()) return;

        this.isLoadingMore.set(true);
        this.currentPage++;

        const container = this.messagesContainer?.nativeElement as
            | HTMLDivElement
            | undefined;
        const prevScrollHeight = container?.scrollHeight ?? 0;

        const result = await this.getPlays(this.currentPage);

        if (!result || !result.items || result.items.length === 0) {
            this.allPlaysLoaded.set(true);
            this.isLoadingMore.set(false);
            return;
        }

        result.items.reverse();

        this.playsPagedSearch.set({
            ...result,
            items: [...result.items, ...(this.playsPagedSearch()?.items ?? [])],
        });

        // A pagination that resolves while a session is being opened must not
        // steal the scroll position from the bottom pin.
        if (container && this.bottomPinFrame === null) {
            container.scrollTop = container.scrollHeight - prevScrollHeight;
        }

        this.isLoadingMore.set(false);

        if (result.items.length < result.pageSize) {
            this.allPlaysLoaded.set(true);
        }
    }

    onScroll(event: Event): void {
        // Ignore the scroll events fired by the bottom pin that runs while a
        // session is being opened, otherwise it would paginate immediately and
        // overwrite the scroll position it just set.
        if (this.bottomPinFrame !== null) return;

        const container = event.target as HTMLDivElement;
        if (container.scrollTop <= 50) {
            this.loadMorePlays();
        }
    }

    async onSubmit(initialPlay: boolean = false): Promise<void> {
        this.loading.set(true);
        let newPlay: NewPlay = {
            gameId: this.gameId(),
            prompt:
                this.newPlayFormGroup.get('newPlayControl')?.value ||
                'Lorem Upsum',
        };

        try {
            await this.playService.streamNewPlay(newPlay, (chunk: StreamPlay) => {
                switch (chunk.eventType) {
                    case 'Start':
                        const playsToAdd: Play[] = [];
                        if (!initialPlay) {
                            const currentPlayerName =
                                this.playsPagedSearch()?.items?.find(
                                    (play) =>
                                        play.playerDtoResponse.type ===
                                        'RealPlayer',
                                )?.playerDtoResponse?.name;
                            const newPlay: Play = {
                                id: '',
                                playerDtoResponse: {
                                    id: '',
                                    name: currentPlayerName ?? $localize`Player`,
                                    type: 'RealPlayer',
                                },
                                prompt:
                                    this.newPlayFormGroup.get('newPlayControl')
                                        ?.value ?? '',
                                createdAt: new Date(),
                            };
                            playsToAdd.push(newPlay);
                        }

                        const response: Play = {
                            id: '',
                            playerDtoResponse: {
                                name: $localize`Master`,
                                type: 'Master',
                            } as Player,
                            prompt: '',
                            createdAt: new Date(),
                        } as Play;
                        playsToAdd.push(response);
                        this.currentResponse.set(response);
                        this.playsPagedSearch.set({
                            ...this.playsPagedSearch()!,
                            items: [...this.playsPagedSearch()!.items!, ...playsToAdd],
                        });
                        this.streamedMessagesStartIndex.set(
                            this.playsPagedSearch()!.items!.length - playsToAdd.length,
                        );
                        this.forceScroll.set(true);
                        this.scrollBotton();
                        break;
                    case 'Chunk':
                        this.currentResponse.update((prev) => {
                            if (prev) {
                                prev.prompt! += chunk.content;
                            }
                            return prev;
                        });
                        this.scrollBotton();
                        break;
                    case 'End':
                        this.loading.set(false);
                        this.currentResponse.set(null);
                        this.streamedMessagesStartIndex.set(null);

                        if (!this.hasError()) {
                            this.newPlayFormGroup.get('newPlayControl')?.reset();
                            this.removeGameCache(this.gameId());
                            this.gamePlayed.emit(this.gameId());
                        }
                        this.hasError.set(false);

                        if (this.textAreaContainer) {
                            this.adjustTextAreaHeightElement(
                                this.textAreaContainer
                                    .nativeElement as HTMLTextAreaElement,
                            );
                            this.textAreaContainer.nativeElement.focus();
                        }
                        break;
                    case 'Error':
                        if (this.streamedMessagesStartIndex() !== null) {
                            const list = [...this.playsPagedSearch()!.items!];
                            list.splice(
                                this.streamedMessagesStartIndex()!,
                                list.length - this.streamedMessagesStartIndex()!,
                            );
                            this.playsPagedSearch.set({
                                ...this.playsPagedSearch()!,
                                items: list,
                            });
                            this.streamedMessagesStartIndex.set(null);
                        }
                        this.hasError.set(true);
                        this.currentResponse.set(null);
                        this.loading.set(false);
                        this.snackBar.addError(
                            $localize`The gods have not answered your call. Speak again, brave adventurer!`,
                        );
                }
            });
        } catch {
            if (!this.hasError()) {
                this.loading.set(false);
                this.snackBar.addError(
                    $localize`Something went wrong. Please try again.`,
                );
            }
        }
    }

    adjustTextAreaHeightEvent(event: Event): void {
        const textArea = event.target as HTMLTextAreaElement;
        this.adjustTextAreaHeightElement(textArea);
    }

    onInputChange(event: Event): void {
        this.adjustTextAreaHeightEvent(event);
        this.saveGameCache(this.gameId(), {
            textbox:
                this.newPlayFormGroup.get('newPlayControl')?.value ?? '',
        });
    }

    adjustTextAreaHeightElement(textArea: HTMLTextAreaElement): void {
        textArea.style.height = 'auto';
        textArea.style.height = `${textArea.scrollHeight}px`;
    }

    /**
     * Scrolls to the bottom once the freshly loaded plays are rendered.
     *
     * `afterNextRender` guarantees the message list is already in the DOM, and
     * the pin keeps the list glued to the bottom for the following frames so
     * late layout (message fade-in, font metrics, the loader being removed)
     * cannot leave the view at the top or in the middle of the list.
     */
    private scrollToBottomAfterRender(): void {
        afterNextRender(
            () => this.ngZone.runOutsideAngular(() => this.pinToBottom()),
            { injector: this.injector },
        );
    }

    private pinToBottom(framesLeft: number = BOTTOM_PIN_FRAMES): void {
        this.cancelBottomPin();

        const container = this.messagesContainer?.nativeElement as
            | HTMLDivElement
            | undefined;
        if (!container) return;

        container.scrollTop = container.scrollHeight;

        if (framesLeft > 0) {
            this.bottomPinFrame = requestAnimationFrame(() => {
                this.bottomPinFrame = null;
                this.pinToBottom(framesLeft - 1);
            });
        }
    }

    private cancelBottomPin(): void {
        if (this.bottomPinFrame !== null) {
            cancelAnimationFrame(this.bottomPinFrame);
            this.bottomPinFrame = null;
        }
    }

    scrollBotton(): void {
        if (this.messagesContainer) {
            const container: HTMLDivElement =
                this.messagesContainer.nativeElement;

            if (this.forceScroll()) {
                container.scrollTop = container.scrollHeight;
                this.forceScroll.set(false);
                return;
            }

            const distanceFromBottom =
                container.scrollHeight -
                container.scrollTop -
                container.clientHeight;
            if (distanceFromBottom > 100) {
                return;
            }

            const lastMessage = container.querySelector(
                '.message:last-child',
            ) as HTMLElement;
            if (lastMessage && lastMessage.offsetHeight > container.clientHeight) {
                return;
            }

            container.scrollTop = container.scrollHeight;
        }
    }

    adjustAllReadyOnlyTextArea(): void {
        const readyOnlyTextAreas: NodeListOf<Element> =
            document.querySelectorAll('textarea[readonly]');

        readyOnlyTextAreas.forEach((textarea) => {
            this.adjustTextAreaHeightElement(textarea as HTMLTextAreaElement);
        });
    }
}
