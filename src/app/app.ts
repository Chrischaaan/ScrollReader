import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { register as registerSwiperElements } from 'swiper/element/bundle';

registerSwiperElements();

/** Hauptkomponente der Anwendung zur Reinigung von Bussen.*/
@Component({
  selector: 'sr-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
