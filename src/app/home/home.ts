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
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BibleVerse } from '@sr/shared/api';
import { BibleApiService } from '@sr/shared/api/api/bible-helloao-api.service';
import { TranslationBook } from '@sr/shared/api/api/translation-books.interface';
import { CookieService } from 'ngx-cookie-service';
import Swiper from 'swiper';
import { register as registerSwipter } from 'swiper/element/bundle';

registerSwipter();

const BOOK_NAME = 'X-SR-Book';
const CHAPTER_NUMBER = 'X-SR-Chapter';
interface BibleFormData {
  book: FormControl<string>;
  chapter: FormControl<number>;
}

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

  private defaultBibleBook = 'MAT';
  private lastReadBook = this.cookieService.get(BOOK_NAME)
    ? this.cookieService.get(BOOK_NAME)
    : this.defaultBibleBook;

  private defaultChapter = 1;
  private lastReadChapter = this.cookieService.get(CHAPTER_NUMBER)
    ? Number(this.cookieService.get(CHAPTER_NUMBER))
    : this.defaultChapter;

  private controls: BibleFormData = {
    book: this.formBuilder.control(this.lastReadBook),
    chapter: this.formBuilder.control(this.lastReadChapter),
  };
  public form = this.formBuilder.group(this.controls);

  public books?: TranslationBook[];
  public chapters: number[] = [];
  public verses: BibleVerse[] = [];

  private swiper?: Swiper;
  private currentVerseIndex = 0;

  /** @inheritdoc */
  public ngOnInit(): void {
    this.bibleApiService.getBooks().subscribe((books: TranslationBook[]) => {
      this.books = books;
      const book = books.find((b) => b.id === this.lastReadBook);
      this.form.controls.book.setValue(book?.id ?? this.defaultBibleBook);
    });

    this.form.controls.book.valueChanges.subscribe((value) => {
      this.updateChapterList(this.currentBook?.lastChapterNumber ?? 0);
      this.form.controls.chapter.setValue(1);
    });
    this.form.controls.chapter.valueChanges.subscribe(() => this.loadChapter());
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

    const lastVerseIndex = this.verses.length - 1;
    this.currentVerseIndex = $event.detail[0].realIndex;
    if (this.currentVerseIndex === lastVerseIndex) {
      const currentCaptcher = Number(this.form.controls.chapter.value);
      let nextChapter: number = currentCaptcher + 1;
      const lastChapter = this.currentBook?.lastChapterNumber ?? 0;
      if (nextChapter > lastChapter) {
        const currentBookIndex = this.currentBook?.order ?? 0;
        const nextBook = this.books?.find((book) => book.order === currentBookIndex + 1);
        if (nextBook) {
          this.form.controls.book.setValue(nextBook.id);
          nextChapter = 1;
        }
      }
      this.form.controls.chapter.setValue(nextChapter);
    }
  }

  /** @inheritdoc */
  public loadChapter(): void {
    this.cookieService.set(BOOK_NAME, this.form.controls.book.value, 90);
    this.cookieService.set(CHAPTER_NUMBER, this.form.controls.chapter.value.toString(), 90);

    this.bibleApiService
      .getVerses(this.form.controls.book.value, this.form.controls.chapter.value)
      .subscribe((response: BibleVerse[]) => {
        this.verses = response;
        this.goToVerse(1);
      });
  }

  private updateChapterList(chapterCount: number): void {
    this.chapters = Array.from({ length: chapterCount }, (_, i) => i + 1);
  }

  private goToVerse(verseNumber: number): void {
    setTimeout(() => {
      this.currentVerseIndex = verseNumber - 1;
      this.swiper?.slideTo(this.currentVerseIndex, undefined, false);
    }, 100);
  }

  /** @inheritdoc */
  public get currentBook(): TranslationBook | undefined {
    return this.books?.find((book) => book.id === this.form.controls.book.value);
  }
}
