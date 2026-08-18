import { Component } from '@angular/core';

@Component({
  selector: 'app-gallery',
  imports: [],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css',
})
export class Gallery {

  bookOpen = false;
  pageOpen = false;
  contentOpen = false;

  currentPage = 0;
  totalPages = 5;

  isClosing = false;

 openBook(): void {

  // CLOSED BOOK -> OPEN COVER
  if (!this.bookOpen) {

    this.bookOpen = true;

    setTimeout(() => {
      this.pageOpen = true;
    }, 1200);

    setTimeout(() => {
      this.contentOpen = true;
    }, 2200);

    return;
  }

  // TURN PAGE 1 -> 5
  if (this.currentPage < this.totalPages) {

    this.currentPage++;

    return;
  }

  // AFTER PAGE 5 -> RESET -> FULL CLOSED BOOK
  this.currentPage = 0;

  this.pageOpen = false;
  this.contentOpen = false;

  this.bookOpen = false;
}


fanOpen = false;

selectedCard: number | null = null;


openFan(): void {

  if (!this.fanOpen) {
    this.fanOpen = true;
  }

}


selectCard(cardNumber: number, event: Event): void {

  // VERY IMPORTANT
  // prevents the card click from triggering openFan()
  event.stopPropagation();

  // keep fan open
  this.fanOpen = true;

  // select clicked card
  this.selectedCard = cardNumber;

}
  viewStory(cardNumber: number, event: Event): void {

  event.stopPropagation();

  console.log('View story:', cardNumber);

  // We can open the gallery/modal here next.
}
}