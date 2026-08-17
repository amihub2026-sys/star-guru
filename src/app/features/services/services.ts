import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [],
  templateUrl: './services.html',
  styleUrl: './services.css'
})
export class Services implements AfterViewInit, OnDestroy {

  /* =========================================
     SERVICES OVERVIEW SECTION
  ========================================= */

  @ViewChild('servicesOverviewSection')
  servicesOverviewSection?: ElementRef<HTMLElement>;
  @ViewChild('foodSection')
foodSection?: ElementRef<HTMLElement>;

  private servicesOverviewObserver?: IntersectionObserver;
  private servicesOverviewTimer?: number;


  /* =========================================
     COMPONENT LIFECYCLE
  ========================================= */

  ngAfterViewInit(): void {

    /*
     * Small delay ensures Angular has finished
     * rendering the ViewChild element.
     */
    window.setTimeout(() => {

      this.initializeServicesOverviewAnimation();

    }, 100);

  }


  /* =========================================
     SERVICES OVERVIEW ANIMATION
  ========================================= */

  private initializeServicesOverviewAnimation(): void {

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

          /*
           * Stop observing after the first reveal.
           */
          this.servicesOverviewObserver?.unobserve(
            section
          );

          this.servicesOverviewTimer =
            window.setTimeout(() => {

              section.classList.add(
                'services-overview-visible'
              );

            }, 100);

        },
        {
          threshold: 0.12,
          rootMargin: '0px 0px -50px 0px'
        }
      );

    this.servicesOverviewObserver.observe(
      section
    );

  }


  /* =========================================
     CLEANUP
  ========================================= */

  ngOnDestroy(): void {

    this.servicesOverviewObserver?.disconnect();

    if (
      this.servicesOverviewTimer !== undefined
    ) {

      window.clearTimeout(
        this.servicesOverviewTimer
      );

    }

  }

}