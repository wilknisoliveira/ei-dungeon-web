import { HttpErrorResponse } from '@angular/common/http';
import {
    AfterViewChecked,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnInit,
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
    @ViewChild('messagesContainer') messagesContainer!: ElementRef;
    @ViewChild('textAreaContainer') textAreaContainer!: ElementRef;

    pageSize: number = 0;
    enableShowMoreAction = true;
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
            this.pageSize = 0;
            await this.showMore();
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

        await this.showMore();
        this.forceScroll = true;
        this.scrollBotton();

        const cache = this.getGameCache(this.gameId);
        if (cache?.['textbox']) {
            this.newPlayFormGroup.get('newPlayControl')?.setValue(cache['textbox']);
        }
    }

    async getPlays(size: number): Promise<PagedSearch<Play> | null> {
        let result: PagedSearch<Play> | null = null;

        try {
            result = await this.playService.getPlays(this.gameId, 'desc', size, 1);
        } catch (error) {
            this.snackBar.addError(
                'Something went wrong while attempting to get the play list.',
            );
            console.log(`Error: ${error}`);
        }

        return result;
    }

    async showMore(): Promise<void> {
        this.pageSize = this.pageSize + 20;

        this.playsPagedSearch = await this.getPlays(this.pageSize);
        if (this.playsPagedSearch?.items) {
            this.playsPagedSearch.items = this.playsPagedSearch?.items?.reverse();
        }

        if (
            this.playsPagedSearch != null &&
            this.pageSize >= this.playsPagedSearch.totalResults
        ) {
            this.enableShowMoreAction = false;
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
