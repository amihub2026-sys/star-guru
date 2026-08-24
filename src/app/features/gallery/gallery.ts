import {
   ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { finalize } from 'rxjs';

import {
  GalleryService,
  GalleryTopic
} from '../../services/gallery.service.ts';

interface GalleryDisplayImage {
  url: string;
  topicId: number;
  topicName: string;
  key: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css'
})
export class Gallery
  implements OnInit, OnDestroy {

  /*
   * ==========================================
   * EXISTING BOOK GALLERY
   * ==========================================
   */

  bookOpen = false;
  pageOpen = false;
  contentOpen = false;

  currentPage = 0;
  totalPages = 5;

  isClosing = false;

  openBook(): void {

    // Closed book -> open cover
    if (!this.bookOpen) {

      this.bookOpen = true;
      this.isClosing = false;

      // Show inside pages
      window.setTimeout(() => {
        this.pageOpen = true;
      }, 250);

      // Show page content
      window.setTimeout(() => {
        this.contentOpen = true;
      }, 450);

      return;
    }

    // Turn page 1 -> 5
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      return;
    }

    // After last page -> close book
    this.closeBook();
  }

  closeBook(): void {
    this.isClosing = true;
    this.contentOpen = false;

    window.setTimeout(() => {
      this.pageOpen = false;
      this.currentPage = 0;
    }, 180);

    window.setTimeout(() => {
      this.bookOpen = false;
      this.isClosing = false;
    }, 450);
  }

  /*
   * ==========================================
   * EXISTING FAN CARDS
   * ==========================================
   */
/*
 * ==========================================
 * EXISTING FAN CARDS
 * ==========================================
 */

fanOpen = false;

selectedCard: number | null = null;

/*
 * Total number of fan cards
 */
private readonly totalFanCards = 6;


/*
 * Open fan.
 *
 * First click on fan:
 * Card 1 comes to front.
 */
openFan(): void {

  if (!this.fanOpen) {

    this.fanOpen = true;

    this.selectedCard = 1;

  }

}


/*
 * Close/reset fan.
 */
closeFan(event?: Event): void {

  event?.stopPropagation();

  this.selectedCard = null;

  this.fanOpen = false;

}


/*
 * Main fan card click logic.
 *
 * Mobile behaviour:
 *
 * Fan
 *  ↓
 * Card 1
 *  ↓
 * Card 2
 *  ↓
 * Card 3
 *  ↓
 * Card 4
 *  ↓
 * Card 5
 *  ↓
 * Card 6
 *  ↓
 * Fan
 */
selectCard(
  cardNumber: number,
  event: Event
): void {

  event.stopPropagation();


  /*
   * FAN CLOSED
   *
   * If user clicks any card while
   * fan is still closed,
   * start from that card.
   */
  if (!this.fanOpen) {

    this.fanOpen = true;

    this.selectedCard = cardNumber;

    return;

  }


  /*
   * FAN OPEN BUT NOTHING SELECTED
   */
  if (this.selectedCard === null) {

    this.selectedCard = cardNumber;

    return;

  }


  /*
   * If another card is clicked directly,
   * bring that clicked card to front.
   */
  if (this.selectedCard !== cardNumber) {

    this.selectedCard = cardNumber;

    return;

  }


  /*
   * CURRENT FRONT CARD CLICKED
   *
   * Move to next card:
   *
   * 1 -> 2
   * 2 -> 3
   * 3 -> 4
   * 4 -> 5
   * 5 -> 6
   */
  if (
    this.selectedCard <
    this.totalFanCards
  ) {

    this.selectedCard =
      this.selectedCard + 1;

    return;

  }


  /*
   * Card 6 clicked.
   *
   * Return to original fan format.
   */
  this.resetFan();

}


/*
 * Reset everything back to
 * original fan layout.
 */
private resetFan(): void {

  this.selectedCard = null;

  this.fanOpen = false;

}


/*
 * Optional existing story function
 */
viewStory(
  cardNumber: number,
  event: Event
): void {

  event.stopPropagation();

  console.log(
    'View story:',
    cardNumber
  );

}

  /*
   * ==========================================
   * DYNAMIC BACKEND GALLERY
   * ==========================================
   */

  topics: GalleryTopic[] = [];

  selectedTopicId: number | 'all' = 'all';

  galleryLoading = false;
  galleryErrorMessage = '';

  /*
   * Used for category-change animation.
   */
  galleryChanging = false;

  /*
   * ==========================================
   * IMAGE LIGHTBOX
   * ==========================================
   */

  lightboxOpen = false;
  currentImageIndex = 0;

constructor(
  private galleryService: GalleryService,
  private changeDetector: ChangeDetectorRef
) {}

  ngOnInit(): void {
    this.loadGallery();
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  /*
   * Load active topics and images from backend.
   */
loadGallery(): void {
  this.galleryLoading = true;
  this.galleryErrorMessage = '';

  this.galleryService
    .getActiveTopics()
    .pipe(
      finalize(() => {
        this.galleryLoading = false;
        this.changeDetector.detectChanges();
      })
    )
    .subscribe({
      next: topics => {
        this.topics = (topics || [])
          .map(topic => ({
            ...topic,
            imageUrls: topic.imageUrls || []
          }))
          .sort(
            (first, second) =>
              first.displayOrder -
                second.displayOrder ||
              first.id - second.id
          );

        this.galleryErrorMessage = '';

        console.log(
          'Gallery topics loaded:',
          this.topics
        );

        this.changeDetector.detectChanges();
      },

      error: error => {
        console.error(
          'Gallery API error:',
          error
        );

        this.galleryErrorMessage =
          error?.status === 0
            ? 'Backend server is not reachable or CORS is blocked.'
            : 'Gallery could not be loaded.';

        this.changeDetector.detectChanges();
      }
    });
}

  /*
   * Select ALL or a particular backend topic.
   */
  selectTopic(
    topicId: number | 'all'
  ): void {

    if (
      this.selectedTopicId === topicId
    ) {
      return;
    }

    this.galleryChanging = true;
    this.closeLightbox();

    /*
     * Small delay creates a smooth fade-out
     * and fade-in transition.
     */
    window.setTimeout(() => {

      this.selectedTopicId = topicId;
      this.currentImageIndex = 0;

      window.setTimeout(() => {
        this.galleryChanging = false;
      }, 80);

    }, 180);
  }

  /*
   * Return images based on the selected topic.
   */
  get visibleImages():
    GalleryDisplayImage[] {

    const selectedTopics =
      this.selectedTopicId === 'all'
        ? this.topics
        : this.topics.filter(
            topic =>
              topic.id ===
              this.selectedTopicId
          );

    return selectedTopics.flatMap(
      topic =>
        (topic.imageUrls || []).map(
          (url, imageIndex) => ({
            url,
            topicId: topic.id,
            topicName:
              topic.topicName,
            key:
              `${topic.id}-${imageIndex}-${url}`
          })
        )
    );
  }

  /*
   * Count all backend gallery images.
   */
  get totalImages(): number {
    return this.topics.reduce(
      (total, topic) =>
        total +
        (topic.imageUrls?.length || 0),
      0
    );
  }

  /*
   * Current lightbox image.
   */
  get currentImage():
    GalleryDisplayImage | null {

    const images =
      this.visibleImages;

    return (
      images[this.currentImageIndex] ||
      null
    );
  }

  /*
   * Open selected image in full-screen view.
   */
  openLightbox(
    imageIndex: number
  ): void {

    if (
      imageIndex < 0 ||
      imageIndex >=
        this.visibleImages.length
    ) {
      return;
    }

    this.currentImageIndex =
      imageIndex;

    this.lightboxOpen = true;

    document.body.style.overflow =
      'hidden';
  }

  /*
   * Close full-screen image.
   */
  closeLightbox(): void {
    this.lightboxOpen = false;

    document.body.style.overflow = '';
  }

  /*
   * Show previous lightbox image.
   */
  showPrevious(
    event?: Event
  ): void {

    event?.stopPropagation();

    const images =
      this.visibleImages;

    if (images.length === 0) {
      return;
    }

    this.currentImageIndex =
      this.currentImageIndex === 0
        ? images.length - 1
        : this.currentImageIndex - 1;
  }

  /*
   * Show next lightbox image.
   */
  showNext(
    event?: Event
  ): void {

    event?.stopPropagation();

    const images =
      this.visibleImages;

    if (images.length === 0) {
      return;
    }

    this.currentImageIndex =
      this.currentImageIndex ===
      images.length - 1
        ? 0
        : this.currentImageIndex + 1;
  }

  stopPropagation(
    event: Event
  ): void {
    event.stopPropagation();
  }

  /*
   * Angular trackBy methods improve image
   * transition performance.
   */
  trackTopic(
    index: number,
    topic: GalleryTopic
  ): number {
    return topic.id;
  }

  trackImage(
    index: number,
    image: GalleryDisplayImage
  ): string {
    return image.key;
  }

  /*
   * ==========================================
   * KEYBOARD CONTROLS
   * ==========================================
   */

@HostListener(
  'document:keydown.escape'
)
handleEscape(): void {

  if (this.lightboxOpen) {

    this.closeLightbox();

    return;

  }

  if (
    this.selectedCard !== null ||
    this.fanOpen
  ) {

    this.resetFan();

  }

}

  @HostListener(
    'document:keydown.arrowleft'
  )
  handleArrowLeft(): void {
    if (this.lightboxOpen) {
      this.showPrevious();
    }
  }

  @HostListener(
    'document:keydown.arrowright'
  )
  handleArrowRight(): void {
    if (this.lightboxOpen) {
      this.showNext();
    }
  }
}