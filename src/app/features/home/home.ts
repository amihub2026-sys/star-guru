import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import {
  HomeNewsApiService,
  HomeNewsItem
} from '../services/home-news.service';
import {
  HomeGalleryImage,
  HomeGalleryService
} from '../../services/home-gallery.service';

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-hero',
  standalone:true,
  imports: [
    CommonModule,
        RouterLink
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements AfterViewInit, OnDestroy {
    
  @ViewChild('impactSection')
  impactSection?: ElementRef<HTMLElement>;

  @ViewChild('founderSection')
  founderSection?: ElementRef<HTMLElement>;
@ViewChild('servicesSection')
servicesSection?: ElementRef<HTMLElement>;

@ViewChildren('serviceCard')
serviceCards?: QueryList<ElementRef<HTMLElement>>;
@ViewChild('promiseSection')
promiseSection?: ElementRef<HTMLElement>;
@ViewChild('gallerySection')
gallerySection?: ElementRef<HTMLElement>;

@ViewChildren('galleryItem')
galleryItems?: QueryList<ElementRef<HTMLElement>>;
@ViewChild('newsSection')
newsSection?: ElementRef<HTMLElement>;

@ViewChildren('newsCard')
newsCards?: QueryList<ElementRef<HTMLElement>>;
@ViewChild('newsSlider')
newsSlider!: ElementRef<HTMLDivElement>;

private newsObserver?: IntersectionObserver;

private newsAnimationTimers: number[] = [];
galleryImages: HomeGalleryImage[] = [];
homeNewsItems: HomeNewsItem[] = [];

selectedGalleryImage: string | null = null;

private galleryObserver?: IntersectionObserver;

private promiseObserver?: IntersectionObserver;
flippedCard: number | null = null;

private servicesObserver?: IntersectionObserver;
  private impactObserver?: IntersectionObserver;
  private founderObserver?: IntersectionObserver;

  private countersStarted = false;

constructor(
  private router: Router,
  private homeGalleryService: HomeGalleryService,
  private homeNewsApiService: HomeNewsApiService,
   private http: HttpClient,
  private cdr: ChangeDetectorRef
) {}


  /*=================================
        AFTER VIEW INITIALIZED
  =================================*/

ngAfterViewInit(): void {

  this.loadGalleryImages();
  this.loadHomeNews();

  setTimeout(() => {

    this.initializeImpactCounter();
    this.initializeFounderAnimation();
    this.initializeServiceAnimations();
    this.initializePromiseAnimation();

  }, 100);

}

loadGalleryImages(): void {

  this.homeGalleryService
    .getGallery()
    .subscribe({

      next: (data: HomeGalleryImage[]) => {

        console.log(
          'Public Home Gallery Images',
          data
        );

        this.galleryImages = data;

        // Refresh the homepage template
        this.cdr.detectChanges();

        // Wait until gallery cards are rendered
        window.setTimeout(() => {

          this.galleryObserver?.disconnect();

          this.initializeGalleryAnimation();

          this.cdr.detectChanges();

        }, 100);
      },

      error: (error: any) => {

        console.error(
          'Public Gallery Load Error',
          error
        );
      }
    });
}
loadHomeNews(): void {

  this.homeNewsApiService
    .getPublicNews()
    .subscribe({

      next: (data: HomeNewsItem[]) => {

        console.log(
          'Public Home News',
          data
        );

        this.homeNewsItems = data;

        this.cdr.detectChanges();

        // Wait until the dynamic news cards are rendered
        window.setTimeout(() => {

          this.newsObserver?.disconnect();

          this.initializeNewsAnimation();

          this.cdr.detectChanges();

        }, 100);

      },

      error: (error: unknown) => {

        console.error(
          'Public Home News Load Error',
          error
        );

      }

    });

}
  /*=================================
        IMPACT COUNTER OBSERVER
  =================================*/

  private initializeImpactCounter(): void {

    const section = this.impactSection?.nativeElement;

    if (!section) {
      console.warn('Impact section not found');
      return;
    }

    this.impactObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {

        entries.forEach((entry: IntersectionObserverEntry) => {

          if (entry.isIntersecting && !this.countersStarted) {

            this.countersStarted = true;

            this.animateCounter(
              'daysCounter',
              876,
              '+'
            );

            this.animateCounter(
              'mealsCounter',
              1000000,
              '+'
            );

            this.animateCounter(
              'peopleCounter',
              1000,
              '+'
            );

            this.impactObserver?.unobserve(section);

          }

        });

      },
      {
        threshold: 0.2
      }
    );

    this.impactObserver.observe(section);

  }


  /*=================================
          COUNTER ANIMATION
  =================================*/

  private animateCounter(
    id: string,
    target: number,
    suffix: string
  ): void {

    const element = document.getElementById(id);

    if (!element) {
      console.warn(`Counter element not found: ${id}`);
      return;
    }

    const duration = 2500;
    const startTime = performance.now();

    element.textContent = `0${suffix}`;

    const updateCounter = (currentTime: number): void => {

      const elapsedTime = currentTime - startTime;

      const progress = Math.min(
        elapsedTime / duration,
        1
      );

      /*
       * Ease-out effect:
       * Fast at the beginning and slow near the end.
       */
      const easedProgress =
        1 - Math.pow(1 - progress, 3);

      const currentValue = Math.floor(
        target * easedProgress
      );

      element.textContent =
        `${currentValue.toLocaleString('en-IN')}${suffix}`;

      if (progress < 1) {

        requestAnimationFrame(updateCounter);

      } else {

        element.textContent =
          `${target.toLocaleString('en-IN')}${suffix}`;

      }

    };

    requestAnimationFrame(updateCounter);

  }


  /*=================================
       FOUNDER SCROLL ANIMATION
  =================================*/

  private initializeFounderAnimation(): void {

    const section = this.founderSection?.nativeElement;

    if (!section) {
      console.warn('Founder section not found');
      return;
    }

    this.founderObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {

        entries.forEach((entry: IntersectionObserverEntry) => {

          if (entry.isIntersecting) {

            section.classList.add('founder-visible');

            this.founderObserver?.unobserve(section);

          }

        });

      },
      {
        threshold: 0.2
      }
    );

    this.founderObserver.observe(section);

  }


  /*=================================
             NAVIGATION
  =================================*/

  exploreJourney(): void {

    this.router.navigate(['/about']);

  }

  volunteer(): void {

    this.router.navigate(['/volunteer']);

  }


  /*=================================
              CLEANUP
  =================================*/

ngOnDestroy(): void {

  this.impactObserver?.disconnect();
  this.founderObserver?.disconnect();
  this.servicesObserver?.disconnect();
  this.promiseObserver?.disconnect();
  this.galleryObserver?.disconnect();

  document.body.style.overflow = '';

}


  private initializeServiceAnimations(): void {

  const section = this.servicesSection?.nativeElement;
  const cards = this.serviceCards?.toArray();

  if (!section || !cards?.length) {
    console.warn('Service cards not found');
    return;
  }

  this.servicesObserver = new IntersectionObserver(
    (entries: IntersectionObserverEntry[]) => {

      entries.forEach((entry: IntersectionObserverEntry) => {

        if (!entry.isIntersecting) {
          return;
        }

        cards.forEach(
          (
            cardReference: ElementRef<HTMLElement>,
            index: number
          ) => {

            window.setTimeout(() => {

              cardReference.nativeElement.classList.add(
                'service-visible'
              );

            }, index * 140);

          }
        );

        this.servicesObserver?.unobserve(section);

      });

    },
    {
      threshold: 0.15
    }
  );

  this.servicesObserver.observe(section);

}


toggleServiceCard(index: number): void {

  if (!this.isTouchDevice()) {
    return;
  }

  this.flippedCard =
    this.flippedCard === index ? null : index;

}


handleCardMove(event: MouseEvent): void {

  if (this.isTouchDevice()) {
    return;
  }

  const card = event.currentTarget as HTMLElement | null;

  if (!card) {
    return;
  }

  const cardInner =
    card.querySelector<HTMLElement>('.flip-card-inner');

  if (!cardInner) {
    return;
  }

  const rect = card.getBoundingClientRect();

  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const rotateY =
    ((mouseX - centerX) / centerX) * 4;

  const rotateX =
    ((centerY - mouseY) / centerY) * 4;

  card.style.setProperty(
    '--rotate-x',
    `${rotateX}deg`
  );

  card.style.setProperty(
    '--rotate-y',
    `${rotateY}deg`
  );

}


resetCardTilt(event: MouseEvent): void {

  const card = event.currentTarget as HTMLElement | null;

  if (!card) {
    return;
  }

  card.style.setProperty(
    '--rotate-x',
    '0deg'
  );

  card.style.setProperty(
    '--rotate-y',
    '0deg'
  );

}


goToServices(event: MouseEvent): void {

  event.stopPropagation();

  this.router.navigate(['/services']);

}


private isTouchDevice(): boolean {

  return (
    window.matchMedia('(hover: none)').matches ||
    navigator.maxTouchPoints > 0
  );

}

private initializePromiseAnimation(): void {

  const section = this.promiseSection?.nativeElement;

  if (!section) {
    console.warn('Promise section not found');
    return;
  }

  this.promiseObserver = new IntersectionObserver(
    (entries: IntersectionObserverEntry[]) => {

      entries.forEach((entry: IntersectionObserverEntry) => {

        if (!entry.isIntersecting) {
          return;
        }

        section.classList.add('promise-visible');

        this.promiseObserver?.unobserve(section);

      });

    },
    {
      threshold: 0.18,
      rootMargin: '0px 0px -60px 0px'
    }
  );

  this.promiseObserver.observe(section);

}

private initializeGalleryAnimation(): void {

  const section = this.gallerySection?.nativeElement;
  const items = this.galleryItems?.toArray();

  if (!section || !items?.length) {
    console.warn('Gallery section or gallery images not found');
    return;
  }

  this.galleryObserver = new IntersectionObserver(
    (entries: IntersectionObserverEntry[]) => {

      const sectionEntry = entries[0];

      if (!sectionEntry?.isIntersecting) {
        return;
      }

      this.galleryObserver?.unobserve(section);

      // Gallery section visible ஆன பிறகு 1.2 seconds wait
      window.setTimeout(() => {

        items.forEach(
          (
            itemReference: ElementRef<HTMLElement>,
            index: number
          ) => {

            // Each image opens one after another
            window.setTimeout(() => {

              itemReference.nativeElement.classList.add(
                'gallery-visible'
              );

            }, index * 250);

          }
        );

      }, 1200);

    },
    {
      threshold: 0.25,
      rootMargin: '0px 0px -100px 0px'
    }
  );

  this.galleryObserver.observe(section);

}


galleryCardMove(event: MouseEvent): void {

  if (
    window.matchMedia('(hover: none)').matches ||
    navigator.maxTouchPoints > 0
  ) {
    return;
  }

  const item =
    event.currentTarget as HTMLElement | null;

  if (!item) {
    return;
  }

  const rect = item.getBoundingClientRect();

  const pointerX =
    event.clientX - rect.left;

  const pointerY =
    event.clientY - rect.top;

  const centerX =
    rect.width / 2;

  const centerY =
    rect.height / 2;

  const rotateY =
    ((pointerX - centerX) / centerX) * 3.5;

  const rotateX =
    ((centerY - pointerY) / centerY) * 3.5;

  item.style.setProperty(
    '--gallery-rotate-x',
    `${rotateX}deg`
  );

  item.style.setProperty(
    '--gallery-rotate-y',
    `${rotateY}deg`
  );

}


galleryCardLeave(event: MouseEvent): void {

  const item =
    event.currentTarget as HTMLElement | null;

  if (!item) {
    return;
  }

  item.style.setProperty(
    '--gallery-rotate-x',
    '0deg'
  );

  item.style.setProperty(
    '--gallery-rotate-y',
    '0deg'
  );

}


openGalleryImage(imagePath: string): void {

  this.selectedGalleryImage = imagePath;

  document.body.style.overflow = 'hidden';

}


closeGalleryImage(): void {

  this.selectedGalleryImage = null;

  document.body.style.overflow = '';

}

private initializeNewsAnimation(): void {

  const section = this.newsSection?.nativeElement;
  const cards = this.newsCards?.toArray();

  if (!section || !cards?.length) {
    console.warn('News section or cards not found');
    return;
  }

  this.newsObserver = new IntersectionObserver(
    (entries: IntersectionObserverEntry[]) => {

      const entry = entries[0];

      if (!entry?.isIntersecting) {
        return;
      }

      this.newsObserver?.unobserve(section);

      /*
       * Section visible ஆன பிறகு
       * 1.2 seconds wait பண்ணும்.
       */
      const mainTimer = window.setTimeout(() => {

        cards.forEach(
          (
            cardReference: ElementRef<HTMLElement>,
            index: number
          ) => {

            const cardTimer = window.setTimeout(() => {

              cardReference.nativeElement.classList.add(
                'news-visible'
              );

            }, index * 350);

            this.newsAnimationTimers.push(cardTimer);

          }
        );

      }, 1200);

      this.newsAnimationTimers.push(mainTimer);

    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -80px 0px'
    }
  );

  this.newsObserver.observe(section);

}

scrollNews(direction: 'left' | 'right'): void {

    const slider = this.newsSlider?.nativeElement;

    if (!slider) {
        return;
    }

    const firstCard = slider.querySelector<HTMLElement>('.news-card');

    const cardWidth = firstCard
        ? firstCard.offsetWidth + 16
        : slider.clientWidth * 0.85;

    slider.scrollBy({
        left: direction === 'right' ? cardWidth : -cardWidth,
        behavior: 'smooth'
    });
}

}