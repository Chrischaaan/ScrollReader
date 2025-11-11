import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BibleVerse } from '@sr/shared/api';
import { BibleApiService } from '@sr/shared/api/api/bible-api.service';
import { CookieService } from 'ngx-cookie-service';
import Swiper from 'swiper';
import { register as registerSwipter } from 'swiper/element/bundle';

registerSwipter();

const BOOK_NAME = 'X-SR-Book';
const CHAPTER_NUMBER = 'X-SR-Chapter';
type BibleFormData = {
  book: FormControl<string>;
  chapter: FormControl<number>;
};

/** HomeKomponente mit Swiper */
@Component({
  selector: 'sr-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Home implements OnInit, AfterViewInit {
  private bibleApiService = inject(BibleApiService);
  private formBuilder = inject(NonNullableFormBuilder);
  private cookieService = inject(CookieService);

  @ViewChild('swiperContainer') swiperContainer!: ElementRef;

  private defaultBibleBook = '1.mose';
  private lastReadBook = !!this.cookieService.get(BOOK_NAME)
    ? this.cookieService.get(BOOK_NAME)
    : this.defaultBibleBook;

  private defaultChapter = 1;
  private lastReadChapter = !!this.cookieService.get(CHAPTER_NUMBER)
    ? Number(this.cookieService.get(CHAPTER_NUMBER))
    : this.defaultChapter;

  private controls: BibleFormData = {
    book: this.formBuilder.control(this.lastReadBook, Validators.required),
    chapter: this.formBuilder.control(this.lastReadChapter, [
      Validators.required,
      Validators.min(1),
    ]),
  };
  public form = this.formBuilder.group(this.controls);

  public books = this.bibleApiService.getBooks();
  public chapters: number[] = [];
  public verses: BibleVerse[] = [];

  private swiper?: Swiper;
  private currentVerseIndex = 0;

  /** @inheritdoc */
  public ngOnInit(): void {
    this.form.controls.book.valueChanges.subscribe(() => {
      this.updateChapterList();
      this.form.controls.chapter.setValue(1);
    });
    this.form.controls.chapter.valueChanges.subscribe(() => this.loadChapter());

    // initial laden
    this.updateChapterList();
    this.loadChapter();
  }

  /** @inheritdoc */
  public ngAfterViewInit(): void {
    this.swiper = this.swiperContainer.nativeElement.swiper;
  }

  /** @inheritdoc */
  public onSlideChange($event: any): void {
    if (!$event.detail[0].isEnd || this.currentVerseIndex === $event.detail[0].realIndex) {
      return;
    }

    console.log('isEnd: ', $event.detail[0]);

    const lastVerseIndex = this.verses.length - 1;
    this.currentVerseIndex = $event.detail[0].realIndex;
    if (this.currentVerseIndex === lastVerseIndex) {
      const currentCaptcher = Number(this.form.controls.chapter.value);
      let nextChapter: number = currentCaptcher + 1;
      const lastChapter = this.bibleApiService.getChapterCount(this.form.controls.book.value);
      if (nextChapter > lastChapter) {
        const currentBook = this.bibleApiService.getBooks().indexOf(this.form.controls.book.value);
        const nextBook = this.bibleApiService.getBooks()[currentBook + 1];
        this.form.controls.book.setValue(nextBook);
        nextChapter = 1;
      }
      this.form.controls.chapter.setValue(nextChapter);
    }
  }

  /** @inheritdoc */
  public loadChapter(): void {
    this.cookieService.set(BOOK_NAME, this.form.controls.book.value, 90);
    this.cookieService.set(CHAPTER_NUMBER, this.form.controls.chapter.value!.toString(), 90);

    this.bibleApiService
      .getVerses(this.form.controls.book.value, this.form.controls.chapter.value)
      .subscribe((response: BibleVerse[]) => {
        this.verses = response;
        this.goToVerse(1);
      });
  }

  private updateChapterList(): void {
    const selectedBook = this.form.controls.book.value;
    const chapterCount = this.bibleApiService.getChapterCount(selectedBook);
    this.chapters = Array.from({ length: chapterCount }, (_, i) => i + 1);
  }

  private goToVerse(verseNumber: number): void {
    setTimeout(() => {
      this.currentVerseIndex = verseNumber - 1;
      this.swiper?.slideTo(this.currentVerseIndex, undefined, false);
    }, 100);
  }
}
