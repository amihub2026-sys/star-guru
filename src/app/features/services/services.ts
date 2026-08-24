import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

import {
  HostListener
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

  /*
   * Store every slider interval
   * so we can clear them when component destroys.
   */
  private sliderIntervals: number[] = [];

  /*
   * Gallery modal image
   */
  selectedGalleryImage: any | null = null;


  constructor(
    private serviceGalleryService:
      ServiceGalleryService,

    private changeDetectorRef:
      ChangeDetectorRef
  ) {}


  /*
   * Runs when component loads
   */
  ngOnInit(): void {

    this.loadServiceGallery();

  }


  /*
   * Runs after HTML has loaded
   */
  ngAfterViewInit(): void {

    window.setTimeout(() => {

      this.initializeServicesOverviewAnimation();

      this.initializeImageSliders();

    }, 300);

  }


  /*
   * Load all active Service Gallery images
   */
  loadServiceGallery(): void {

    this.galleryLoading = true;

    this.serviceGalleryService
      .getAllActiveImages()
      .subscribe({

        next: (
          images: ServiceGalleryImage[]
        ) => {

          console.log(
            'SERVICE GALLERY:',
            images
          );

          this.serviceGalleryImages = [
            ...images
          ];

          this.galleryLoading = false;

          this.changeDetectorRef
            .detectChanges();

        },

        error: (error: unknown) => {

          console.error(
            'SERVICE GALLERY ERROR:',
            error
          );

          this.serviceGalleryImages = [];

          this.galleryLoading = false;

          this.changeDetectorRef
            .detectChanges();

        }

      });

  }


  /*
   * ========================================
   * IMAGE SLIDERS
   * ========================================
   *
   * Finds every .image-slider
   * and changes the active image every 3 sec.
   */
  private initializeImageSliders(): void {

    /*
     * Prevent duplicate intervals
     * if this method gets called again.
     */
    this.clearSliderIntervals();

    const sliders =
      document.querySelectorAll<HTMLElement>(
        '.image-slider'
      );

    console.log(
      'TOTAL IMAGE SLIDERS FOUND:',
      sliders.length
    );

    sliders.forEach(
      (
        slider: HTMLElement,
        sliderIndex: number
      ) => {

        const images =
          slider.querySelectorAll<HTMLImageElement>(
            'img'
          );

        console.log(
          `SLIDER ${sliderIndex + 1} IMAGES:`,
          images.length
        );

        /*
         * Nothing to slide
         */
        if (images.length === 0) {

          return;

        }

        let currentIndex = 0;

        /*
         * Remove active class
         * from every image first
         */
        images.forEach(
          (
            image: HTMLImageElement
          ) => {

            image.classList.remove(
              'active'
            );

          }
        );

        /*
         * Show first image
         */
        images[0].classList.add(
          'active'
        );


        /*
         * If only one image,
         * no interval is needed
         */
        if (images.length === 1) {

          return;

        }


        /*
         * Start automatic slider
         */
        const intervalId =
          window.setInterval(
            () => {

              /*
               * Hide current image
               */
              images[
                currentIndex
              ].classList.remove(
                'active'
              );


              /*
               * Move to next image
               */
              currentIndex =
                (
                  currentIndex + 1
                ) % images.length;


              /*
               * Show next image
               */
              images[
                currentIndex
              ].classList.add(
                'active'
              );

            },
            3000
          );


        /*
         * Store interval
         */
        this.sliderIntervals.push(
          intervalId
        );

      }
    );

  }


  /*
   * Clear all slider timers
   */
  private clearSliderIntervals(): void {

    this.sliderIntervals.forEach(
      (
        intervalId: number
      ) => {

        window.clearInterval(
          intervalId
        );

      }
    );

    this.sliderIntervals = [];

  }


  /*
   * ========================================
   * SERVICES OVERVIEW ANIMATION
   * ========================================
   */
  private initializeServicesOverviewAnimation():
    void {

    const section =
      this.servicesOverviewSection
        ?.nativeElement;

    if (!section) {

      console.warn(
        'Services overview section not found'
      );

      return;

    }

    this.servicesOverviewObserver =
      new IntersectionObserver(

        (
          entries:
            IntersectionObserverEntry[]
        ) => {

          const entry =
            entries[0];

          if (
            !entry?.isIntersecting
          ) {

            return;

          }

          this.servicesOverviewObserver
            ?.unobserve(
              section
            );

          this.servicesOverviewTimer =
            window.setTimeout(
              () => {

                section.classList.add(
                  'services-overview-visible'
                );

              },
              100
            );

        },

        {
          threshold: 0.12,

          rootMargin:
            '0px 0px -50px 0px'
        }

      );

    this.servicesOverviewObserver
      .observe(
        section
      );

  }


  /*
   * ========================================
   * GALLERY MODAL
   * ========================================
   */
  openGalleryImage(
    image: any
  ): void {

    this.selectedGalleryImage =
      image;

    if (
      typeof document !==
      'undefined'
    ) {

      document.body.style.overflow =
        'hidden';

    }

  }


  closeGalleryImage(): void {

    this.selectedGalleryImage =
      null;

    if (
      typeof document !==
      'undefined'
    ) {

      document.body.style.overflow =
        '';

    }

  }


  @HostListener(
    'document:keydown.escape'
  )
  handleEscapeKey(): void {

    if (
      this.selectedGalleryImage
    ) {

      this.closeGalleryImage();

    }

  }


  /*
   * ========================================
   * CLEAN UP
   * ========================================
   */
  ngOnDestroy(): void {

    /*
     * Disconnect overview observer
     */
    this.servicesOverviewObserver
      ?.disconnect();


    /*
     * Clear overview timer
     */
    if (
      this.servicesOverviewTimer !==
      undefined
    ) {

      window.clearTimeout(
        this.servicesOverviewTimer
      );

    }


    /*
     * Stop all image sliders
     */
    this.clearSliderIntervals();


    /*
     * Restore body scroll
     */
    if (
      typeof document !==
      'undefined'
    ) {

      document.body.style.overflow =
        '';

    }

  }

}