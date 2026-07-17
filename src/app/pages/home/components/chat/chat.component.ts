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
        this.game = await this.gameService.getById(this.gameId);

        if (changes['gameId']) {
            this.pageSize = 0;
            await this.showMore();
            this.forceScroll = true;
            this.goToBotton = true;
        }
    }

    async ngOnInit(): Promise<void> {
        this.game = await this.gameService.getById(this.gameId);

        await this.showMore();
        this.forceScroll = true;
        this.scrollBotton();
    }

    async getPlays(size: number): Promise<PagedSearch<Play> | null> {
        let result: PagedSearch<Play> | null = null;

        try {
            result = await this.playService.getPlays(this.gameId, size);
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
        if (this.playsPagedSearch?.list) {
            this.playsPagedSearch.list = this.playsPagedSearch?.list?.reverse();
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

        this.playService.streamNewPlay(newPlay, (chunk: StreamPlay) => {
            switch (chunk.eventType) {
                case 'Start':
                    const playsToAdd: Play[] = [];
                    if (!initialPlay) {
                        const currentPlayerName =
                            this.playsPagedSearch?.list?.find(
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
                    // Force to refresh the detect changes
                    this.playsPagedSearch = {
                        ...this.playsPagedSearch!,
                        list: [...this.playsPagedSearch!.list!, ...playsToAdd],
                    };
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
                    this.newPlayFormGroup.get('newPlayControl')?.reset();

                    if (this.textAreaContainer) {
                        this.adjustTextAreaHeightElement(
                            this.textAreaContainer
                                .nativeElement as HTMLTextAreaElement,
                        );
                        this.textAreaContainer.nativeElement.focus();
                    }
                    break;
                case 'Error':
                    this.currentResponse = null;
                    this.loading = false;
                    this.snackBar.addError(
                        'Something went wrong while attempting to send your play.',
                    );
            }
        });
    }

    adjustTextAreaHeightEvent(event: Event): void {
        const textArea = event.target as HTMLTextAreaElement;
        this.adjustTextAreaHeightElement(textArea);
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
