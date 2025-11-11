import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BibleVerse } from '../model/bible-verse.model';

interface BibleApiResponse {
  data: BibleVerse[];
}

/** Bibeltexte abfragen */
@Injectable({
  providedIn: 'root',
})
export class BibleApiService {
  private http = inject(HttpClient);

  private BIBLE_BOOKS: string[] = [
    '1.mose',
    '2.mose',
    '3.mose',
    '4.mose',
    '5.mose',
    'josua',
    'richter',
    'ruth',
    '1.samuel',
    '2.samuel',
    '1.könige',
    '2.könige',
    '1.chronika',
    '2.chronika',
    'esra',
    'nehemia',
    'esther',
    'hiob',
    'psalm',
    'sprüche',
    'prediger',
    'hohelied',
    'jesaja',
    'jeremia',
    'klagelieder',
    'hesekiel',
    'daniel',
    'hosea',
    'joel',
    'amos',
    'obadja',
    'jona',
    'micha',
    'nahum',
    'habakuk',
    'zephanja',
    'haggai',
    'sacharja',
    'maleachi',
    'matthäus',
    'markus',
    'lukas',
    'johannes',
    'apostelgeschichte',
    'römer',
    '1.korinther',
    '2.korinther',
    'galater',
    'epheser',
    'philipper',
    'kolosser',
    '1.thessalonicher',
    '2.thessalonicher',
    '1.timotheus',
    '2.timotheus',
    'titus',
    'philemon',
    'hebräer',
    'jakobus',
    '1.petrus',
    '2.petrus',
    '1.johannes',
    '2.johannes',
    '3.johannes',
    'judas',
    'offenbarung',
  ];
  private CHAPTER_COUNT: { [book: string]: number } = {
    '1.mose': 50,
    '2.mose': 40,
    '3.mose': 27,
    '4.mose': 36,
    '5.mose': 34,
    josua: 24,
    richter: 21,
    ruth: 4,
    '1.samuel': 31,
    '2.samuel': 24,
    '1.könige': 22,
    '2.könige': 25,
    '1.chronika': 29,
    '2.chronika': 36,
    esra: 10,
    nehemia: 13,
    esther: 10,
    hiob: 42,
    psalm: 150,
    sprüche: 31,
    prediger: 12,
    hohelied: 8,
    jesaja: 66,
    jeremia: 52,
    klagelieder: 5,
    hesekiel: 48,
    daniel: 12,
    hosea: 14,
    joel: 3,
    amos: 9,
    obadja: 1,
    jona: 4,
    micha: 7,
    nahum: 3,
    habakuk: 3,
    zephanja: 3,
    haggai: 2,
    sacharja: 14,
    maleachi: 4,
    matthäus: 28,
    markus: 16,
    lukas: 24,
    johannes: 21,
    apostelgeschichte: 28,
    römer: 16,
    '1.korinther': 16,
    '2.korinther': 13,
    galater: 6,
    epheser: 6,
    philipper: 4,
    kolosser: 4,
    '1.thessalonicher': 5,
    '2.thessalonicher': 3,
    '1.timotheus': 6,
    '2.timotheus': 4,
    titus: 3,
    philemon: 1,
    hebräer: 13,
    jakobus: 5,
    '1.petrus': 5,
    '2.petrus': 3,
    '1.johannes': 5,
    '2.johannes': 1,
    '3.johannes': 1,
    judas: 1,
    offenbarung: 22,
  };

  /** Gibt alle biblischen Bücher sortiert in der üblichen Reihenfolge zurück. */
  public getBooks(): string[] {
    return this.BIBLE_BOOKS;
  }

  /** Gibt die Kapitelanzahl für das jeweilige Bibelbuch zurück. */
  public getChapterCount(book: string): number {
    return this.CHAPTER_COUNT[book] || 1;
  }

  /**
   * Liefert die Bibelverse einer Bibel zurück.
   * @param {string} book Bibelbuch
   * @param {number} chapter Kapitel
   * @param {string} version Übersetzung. Standard = Luther
   * @returns {Array<string>} Array mit Versen des Kapitels
   */
  public getVerses(
    book: string,
    chapter: number,
    version = 'de-DE-elbbk',
  ): Observable<BibleVerse[]> {
    const url = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/${version}/books/${book}/chapters/${chapter}.json`;
    return this.http.get<BibleApiResponse>(url).pipe(map((res) => res.data));
  }
}
