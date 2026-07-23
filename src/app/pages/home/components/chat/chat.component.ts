import { HttpErrorResponse } from '@angular/common/http';
import {
    AfterViewChecked,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GameService } from 'src/app/service/game/game.service';
import { PlayService } from 'src/app/service/play/play.service';
import { SnackbarService } from 'src/app/service/snackbar/snackbar.service';
import { Game } from 'src/app/types/game/game';
import { PagedSearch } from 'src/app/types/general/paged-search';
import { NewPlay } from 'src/app/types/play/new-play';
import { Play } from 'src/app/types/play/play';
import { Player } from 'src/app/types/play/player';
import { StreamPlay } from 'src/app/types/play/stream-play';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnChanges, AfterViewChecked {
    @Input() gameId: string = '';
    @Output() gamePlayed = new EventEmitter<string>();
    @ViewChild('messagesContainer') messagesContainer!: ElementRef;
    @ViewChild('textAreaContainer') textAreaContainer!: ElementRef;

    currentPage: number = 1;
    isLoadingMore: boolean = false;
    allPlaysLoaded: boolean = false;
    currentResponse: Play | null = null;
    playsPagedSearch: PagedSearch<Play> | null = null;
    newPlayFormGroup: FormGroup;
    goToBotton: boolean = false;
    forceScroll: boolean = false;
    loading: boolean = false;
    game: Game | null = null;
    streamedMessagesStartIndex: number | null = null;
    hasError: boolean = false;

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
        private cdr: ChangeDetectorRef,
    ) {
        this.newPlayFormGroup = this._formBuilder.group({
            newPlayControl: ['', Validators.required],
        });
    }

    ngAfterViewChecked(): void {
        this.adjustAllReadyOnlyTextArea();

        if (this.goToBotton) {
            this.scrollBotton();
            this.goToBotton = false;
        }
    }

    async ngOnChanges(changes: SimpleChanges): Promise<void> {
        const previousGameId = changes['gameId']?.previousValue;
        if (previousGameId) {
            this.saveGameCache(previousGameId, {
                textbox:
                    this.newPlayFormGroup.get('newPlayControl')?.value ?? '',
            });
        }

        this.game = await this.gameService.getById(this.gameId);

        if (changes['gameId']) {
            await this.loadInitialPlays();
            this.forceScroll = true;
            this.goToBotton = true;

            const cache = this.getGameCache(this.gameId);
            this.newPlayFormGroup
                .get('newPlayControl')
                ?.setValue(cache?.['textbox'] ?? '');
        }
    }

    async ngOnInit(): Promise<void> {
        this.game = await this.gameService.getById(this.gameId);

        await this.loadInitialPlays();
        this.forceScroll = true;
        this.scrollBotton();

        const cache = this.getGameCache(this.gameId);
        if (cache?.['textbox']) {
            this.newPlayFormGroup.get('newPlayControl')?.setValue(cache['textbox']);
        }
    }

    async getPlays(page: number): Promise<PagedSearch<Play> | null> {
        try {
            return await this.playService.getPlays(this.gameId, 'desc', 20, page);
        } catch (error) {
            this.snackBar.addError(
                'Something went wrong while attempting to get the play list.',
            );
            console.log(`Error: ${error}`);
            return null;
        }
    }

    async loadInitialPlays(): Promise<void> {
        this.currentPage = 1;
        this.allPlaysLoaded = false;
        this.isLoadingMore = false;

        this.playsPagedSearch = await this.getPlays(1);
        if (this.playsPagedSearch?.items) {
            this.playsPagedSearch.items = this.playsPagedSearch.items.reverse();
        }
    }

    async loadMorePlays(): Promise<void> {
        if (this.isLoadingMore || this.allPlaysLoaded) return;

        this.isLoadingMore = true;
        this.currentPage++;

        const container = this.messagesContainer?.nativeElement as
            | HTMLDivElement
            | undefined;
        const prevScrollHeight = container?.scrollHeight ?? 0;

        const result = await this.getPlays(this.currentPage);

        if (!result || !result.items || result.items.length === 0) {
            this.allPlaysLoaded = true;
            this.isLoadingMore = false;
            return;
        }

        result.items.reverse();

        this.playsPagedSearch = {
            ...result,
            items: [...result.items, ...(this.playsPagedSearch?.items ?? [])],
        };

        this.cdr.detectChanges();

        if (container) {
            container.scrollTop = container.scrollHeight - prevScrollHeight;
        }

        this.isLoadingMore = false;

        if (result.items.length < result.pageSize) {
            this.allPlaysLoaded = true;
        }
    }

    onScroll(event: Event): void {
        const container = event.target as HTMLDivElement;
        if (container.scrollTop <= 50) {
            this.loadMorePlays();
        }
    }

    async onSubmit(initialPlay: boolean = false): Promise<void> {
        this.loading = true;
        let newPlay: NewPlay = {
            gameId: this.gameId,
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
                                this.playsPagedSearch?.items?.find(
                                    (play) =>
                                        play.playerDtoResponse.type ===
                                        'RealPlayer',
                                )?.playerDtoResponse?.name;
                            const newPlay: Play = {
                                id: '',
                                playerDtoResponse: {
                                    id: '',
                                    name: currentPlayerName ?? 'Player',
                                    type: 'RealPlayer',
                                },
                                prompt:
                                    this.newPlayFormGroup.get('newPlayControl')
                                        ?.value ?? '',
                                createdAt: new Date(),
                            };
                            playsToAdd.push(newPlay);
                        }

                        this.currentResponse = {
                            id: '',
                            playerDtoResponse: {
                                name: 'Master',
                                type: 'Master',
                            } as Player,
                            prompt: '',
                            createdAt: new Date(),
                        } as Play;
                        playsToAdd.push(this.currentResponse);
                        this.playsPagedSearch = {
                            ...this.playsPagedSearch!,
                            items: [...this.playsPagedSearch!.items!, ...playsToAdd],
                        };
                        this.streamedMessagesStartIndex =
                            this.playsPagedSearch!.items!.length - playsToAdd.length;
                        this.cdr.detectChanges();
                        this.forceScroll = true;
                        this.scrollBotton();
                        break;
                    case 'Chunk':
                        this.currentResponse!.prompt! += chunk.content;
                        this.cdr.detectChanges();
                        this.scrollBotton();
                        break;
                    case 'End':
                        this.loading = false;
                        this.currentResponse = null;
                        this.streamedMessagesStartIndex = null;

                        if (!this.hasError) {
                            this.newPlayFormGroup.get('newPlayControl')?.reset();
                            this.removeGameCache(this.gameId);
                            this.gamePlayed.emit(this.gameId);
                        }
                        this.hasError = false;

                        if (this.textAreaContainer) {
                            this.adjustTextAreaHeightElement(
                                this.textAreaContainer
                                    .nativeElement as HTMLTextAreaElement,
                            );
                            this.textAreaContainer.nativeElement.focus();
                        }
                        break;
                    case 'Error':
                        if (this.streamedMessagesStartIndex !== null) {
                            const list = [...this.playsPagedSearch!.items!];
                            list.splice(
                                this.streamedMessagesStartIndex,
                                list.length - this.streamedMessagesStartIndex,
                            );
                            this.playsPagedSearch = {
                                ...this.playsPagedSearch!,
                                items: list,
                            };
                            this.streamedMessagesStartIndex = null;
                            this.cdr.detectChanges();
                        }
                        this.hasError = true;
                        this.currentResponse = null;
                        this.loading = false;
                        this.snackBar.addError(
                            'The gods have not answered your call. Speak again, brave adventurer!',
                        );
                }
            });
        } catch {
            if (!this.hasError) {
                this.loading = false;
                this.snackBar.addError(
                    'Something went wrong. Please try again.',
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
        this.saveGameCache(this.gameId, {
            textbox:
                this.newPlayFormGroup.get('newPlayControl')?.value ?? '',
        });
    }

    adjustTextAreaHeightElement(textArea: HTMLTextAreaElement): void {
        textArea.style.height = 'auto';
        textArea.style.height = `${textArea.scrollHeight}px`;
    }

    scrollBotton(): void {
        if (this.messagesContainer) {
            const container: HTMLDivElement =
                this.messagesContainer.nativeElement;

            if (this.forceScroll) {
                container.scrollTop = container.scrollHeight;
                this.forceScroll = false;
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
                'mat-list-item:last-child',
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
