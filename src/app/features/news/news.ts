import { CommonModule } from '@angular/common';
import { Component,NgZone, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

import {
  NewsCard,
  NewsService
} from '../../services/news.service';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news.html',
  styleUrl: './news.css'
})
export class News implements OnInit {

  eventCards: NewsCard[] = [];

eventsLoading = true;
eventsErrorMessage = '';

  newsCards: NewsCard[] = [];


  loading = true;
  errorMessage = '';

  mediaCards: NewsCard[] = [];

mediaLoading = true;
mediaErrorMessage = '';



constructor(
  private newsService: NewsService,
  private cdr: ChangeDetectorRef,
  private ngZone: NgZone
) {
}

ngOnInit(): void {

  this.loadNews();
  this.loadEvents();
  this.loadMedia();
}

 loadNews(): void {

  this.loading = true;
  this.errorMessage = '';

  this.newsService.getPublicNews().subscribe({
    next: (response) => {

      console.log('News received:', response);

      this.newsCards = response;
      this.loading = false;

      this.cdr.detectChanges();
    },

    error: (error) => {

      console.error('News API error:', error);

      this.errorMessage =
        'Unable to load news cards.';

      this.loading = false;

      this.cdr.detectChanges();
    }
  });
}

loadEvents(): void {

  this.eventsLoading = true;
  this.eventsErrorMessage = '';

  this.newsService.getPublicEvents()
    .subscribe({
      next: (response) => {

        this.eventCards = response;
        this.eventsLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Events API error:',
          error
        );

        this.eventsErrorMessage =
          'Unable to load upcoming events.';

        this.eventsLoading = false;

        this.cdr.detectChanges();
      }
    });
}


loadMedia(): void {

  this.mediaLoading = true;
  this.mediaErrorMessage = '';

  this.newsService.getPublicMedia()
    .subscribe({

      next: (response) => {

        this.ngZone.run(() => {

          this.mediaCards = response;
          this.mediaLoading = false;

          this.cdr.detectChanges();
        });
      },

      error: (error) => {

        console.error(
          'Public media error:',
          error
        );

        this.ngZone.run(() => {

          this.mediaLoading = false;

          this.mediaErrorMessage =
            'Unable to load media cards.';

          this.cdr.detectChanges();
        });
      }

    });

    
}


}