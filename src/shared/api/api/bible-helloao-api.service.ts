import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BibleVerse } from '../model/bible-verse.model';
import { TranslationBookChapter } from './translation-book-chapter.interface';
import { TranslationBook, TranslationBooks } from './translation-books.interface';

/** Bibeltexte abfragen */
@Injectable({
  providedIn: 'root',
})
export class BibleApiService {
  private http = inject(HttpClient);
  private readonly translation = 'deu_elbbk/';
  private server = 'https://bible.helloao.org/api/';

  /** Gibt alle biblischen Bücher sortiert in der üblichen Reihenfolge zurück. */
  public getBooks(): Observable<TranslationBook[]> {
    const url = `${this.server}${this.translation}books.json`;
    return this.http.get<TranslationBooks>(url).pipe(map((res) => res.books));
  }

  /**
   * Liefert die Bibelverse einer Bibel zurück.
   * @param {string} book Bibelbuch
   * @param {number} chapter Kapitel
   * @returns {Array<string>} Array mit Versen des Kapitels
   */
  public getVerses(book: string, chapter: number): Observable<BibleVerse[]> {
    const url = `${this.server}${this.translation}${book}/${chapter}.json`;
    return this.http.get<TranslationBookChapter>(url).pipe(
      map((bookChapter: TranslationBookChapter) =>
        bookChapter.chapter.content
          .filter((item) => item.type === 'verse')
          .map((verse) => ({
            ...verse,
            content: verse.content.filter((c) => typeof c === 'string').join(' '),
          })),
      ),
    );
  }
}
