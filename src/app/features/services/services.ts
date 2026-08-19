import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ServiceGalleryImage,
  ServiceGalleryService
} from '../../services/service-gallery';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './services.html',
  styleUrl: './services.css'
})
export class Services
  implements OnInit, AfterViewInit, OnDestroy {

  /*
   * Dynamic Service Gallery
   */
  serviceGalleryImages: ServiceGalleryImage[] = [];

  galleryLoading = false;

  /*
   * Services Overview section
   */
  @ViewChild('servicesOverviewSection')
  servicesOverviewSection?: ElementRef<HTMLElement>;

  @ViewChild('foodSection')
  foodSection?: ElementRef<HTMLElement>;

  private servicesOverviewObserver?:
    IntersectionObserver;

  private servicesOverviewTimer?: number;

  constructor(
    private serviceGalleryService:
      ServiceGalleryService,

    private changeDetectorRef:
      ChangeDetectorRef
  ) {}

  /*
   * Runs when the component loads.
   */
  ngOnInit(): void {
    this.loadServiceGallery();
  }

  /*
   * Runs after HTML ViewChild elements are ready.
   */
  ngAfterViewInit(): void {
    window.setTimeout(() => {
      this.initializeServicesOverviewAnimation();
    }, 100);
  }

  

  /*
   * Load all active Service Gallery images.
   */

loadServiceGallery(): void {
  this.galleryLoading = true;

  this.serviceGalleryService
    .getAllActiveImages()
    .subscribe({
      next: (images: ServiceGalleryImage[]) => {
        console.log('SERVICE GALLERY:', images);

        this.serviceGalleryImages = [...images];
        this.galleryLoading = false;

        this.changeDetectorRef.detectChanges();
      },
      error: (error: unknown) => {
        console.error(
          'SERVICE GALLERY ERROR:',
          error
        );

        this.serviceGalleryImages = [];
        this.galleryLoading = false;

        this.changeDetectorRef.detectChanges();
      }
    });
}
  /*
   * Services Overview scroll animation.
   */
  private initializeServicesOverviewAnimation():
    void {

    const section =
      this.servicesOverviewSection?.nativeElement;

    if (!section) {
      console.warn(
        'Services overview section not found'
      );

      return;
    }

    this.servicesOverviewObserver =
      new IntersectionObserver(
        (
          entries: IntersectionObserverEntry[]
        ) => {
          const entry = entries[0];

          if (!entry?.isIntersecting) {
            return;
          }

          this.servicesOverviewObserver
            ?.unobserve(section);

          this.servicesOverviewTimer =
            window.setTimeout(() => {
              section.classList.add(
                'services-overview-visible'
              );
            }, 100);
        },
        {
          threshold: 0.12,
          rootMargin:
            '0px 0px -50px 0px'
        }
      );

    this.servicesOverviewObserver.observe(
      section
    );
  }

  /*
   * Disconnect observers and clear timers.
   */
  ngOnDestroy(): void {
    this.servicesOverviewObserver
      ?.disconnect();

    if (
      this.servicesOverviewTimer !== undefined
    ) {
      window.clearTimeout(
        this.servicesOverviewTimer
      );
    }
  }
}