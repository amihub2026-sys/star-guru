import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About implements AfterViewInit, OnDestroy {

  /* =========================
     IMPACT SECTION
  ========================= */

  @ViewChild('impactSection')
  impactSection?: ElementRef<HTMLElement>;
  @ViewChild('journeySection')
journeySection?: ElementRef<HTMLElement>;
@ViewChild('whoWeAreSection')
whoWeAreSection?: ElementRef<HTMLElement>;
@ViewChild('missionSection')
missionSection?: ElementRef<HTMLElement>;
@ViewChild('gallerySection')
gallerySection?: ElementRef<HTMLElement>;

private galleryObserver?: IntersectionObserver;
private galleryTimer?: number;

private missionObserver?: IntersectionObserver;
private missionTimer?: number;

private whoWeAreObserver?: IntersectionObserver;
private whoWeAreTimer?: number;

private journeyObserver?: IntersectionObserver;
private journeyTimer?: number;

  private impactObserver?: IntersectionObserver;
  private counterStarted = false;


  /* =========================
     FOUNDER MESSAGE SECTION
  ========================= */

  @ViewChild('founderMessageSection')
  founderMessageSection?: ElementRef<HTMLElement>;

  private founderMessageObserver?: IntersectionObserver;
  private founderMessageTimer?: number;


  /* =========================
     COMPONENT LIFECYCLE
  ========================= */

  ngAfterViewInit(): void {

    /*
     * setTimeout ensures Angular has completed
     * rendering all ViewChild elements.
     */
    window.setTimeout(() => {
      this.initializeWhoWeAreAnimation();
      this.initializeJourneyAnimation();
      this.initializeImpactCounter();
      this.initializeFounderMessageAnimation();
      this.initializeMissionAnimation();
      this.initializeGalleryAnimation();

    }, 100);

  }


  /* =========================
     IMPACT COUNTER
  ========================= */

  private initializeImpactCounter(): void {

    const section = this.impactSection?.nativeElement;

    if (!section) {
      console.warn('Impact section not found');
      return;
    }

    this.impactObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {

        entries.forEach((entry: IntersectionObserverEntry) => {

          if (
            !entry.isIntersecting ||
            this.counterStarted
          ) {
            return;
          }

         this.counterStarted = true;

section.classList.add('impact-visible');

window.setTimeout(() => {

    this.startCounters(section);

}, 450);

this.impactObserver?.unobserve(section);

        });

      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -60px 0px'
      }
    );

    this.impactObserver.observe(section);

  }


  private startCounters(section: HTMLElement): void {

    const counters =
      section.querySelectorAll<HTMLElement>('.counter');

    counters.forEach((counter: HTMLElement) => {

      const targetValue =
        Number(counter.getAttribute('data-target') ?? 0);

      if (
        Number.isNaN(targetValue) ||
        targetValue < 0
      ) {
        counter.textContent = '0';
        return;
      }

      const duration = 2000;
      const startTime = performance.now();

      counter.textContent = '0';

      const updateCounter = (currentTime: number): void => {

        const elapsedTime = currentTime - startTime;

        const progress = Math.min(
          elapsedTime / duration,
          1
        );

        /*
         * Ease-out animation gives a smoother
         * professional counter effect.
         */
        const easedProgress =
          1 - Math.pow(1 - progress, 3);

        const currentValue = Math.floor(
          targetValue * easedProgress
        );

        counter.textContent =
          currentValue.toLocaleString('en-IN');

        if (progress < 1) {

          window.requestAnimationFrame(updateCounter);

          return;
        }

        counter.textContent =
          targetValue.toLocaleString('en-IN');

      };

      window.requestAnimationFrame(updateCounter);

    });

  }


  /* =========================
     FOUNDER MESSAGE ANIMATION
  ========================= */

  private initializeFounderMessageAnimation(): void {

    const section =
      this.founderMessageSection?.nativeElement;

    if (!section) {
      console.warn('Founder message section not found');
      return;
    }

    this.founderMessageObserver =
      new IntersectionObserver(
        (entries: IntersectionObserverEntry[]) => {

          const entry = entries[0];

          if (!entry?.isIntersecting) {
            return;
          }

          this.founderMessageObserver?.unobserve(section);

          /*
           * Small delay after entering viewport.
           */
          this.founderMessageTimer =
            window.setTimeout(() => {

              /*
               * This must match the CSS:
               *
               * .founder-message-section.message-visible
               */
              section.classList.add('message-visible');

            }, 250);

        },
        {
          threshold: 0.15,
          rootMargin: '0px 0px -60px 0px'
        }
      );

    this.founderMessageObserver.observe(section);

  }

  /* =========================
   JOURNEY ANIMATION
========================= */

private initializeJourneyAnimation(): void {

    const section =
        this.journeySection?.nativeElement;

    if (!section) {
        console.warn('Journey section not found');
        return;
    }

    this.journeyObserver =
        new IntersectionObserver(
            (
                entries: IntersectionObserverEntry[]
            ) => {

                const entry = entries[0];

                if (!entry?.isIntersecting) {
                    return;
                }

                this.journeyObserver?.unobserve(section);

                this.journeyTimer =
                    window.setTimeout(() => {

                        section.classList.add(
                            'journey-visible'
                        );

                    }, 100);

            },
            {
                threshold: 0.12,
                rootMargin: '0px 0px -50px 0px'
            }
        );

    this.journeyObserver.observe(section);

}
/* =========================
   WHO WE ARE ANIMATION
========================= */

private initializeWhoWeAreAnimation(): void {

    const section =
        this.whoWeAreSection?.nativeElement;

    if (!section) {
        console.warn('Who we are section not found');
        return;
    }

    this.whoWeAreObserver =
        new IntersectionObserver(
            (
                entries: IntersectionObserverEntry[]
            ) => {

                const entry = entries[0];

                if (!entry?.isIntersecting) {
                    return;
                }

                this.whoWeAreObserver?.unobserve(section);

                this.whoWeAreTimer =
                    window.setTimeout(() => {

                        section.classList.add(
                            'who-visible'
                        );

                    }, 100);

            },
            {
                threshold: 0.12,
                rootMargin: '0px 0px -50px 0px'
            }
        );

    this.whoWeAreObserver.observe(section);

}

/* =========================
   MISSION ANIMATION
========================= */

private initializeMissionAnimation(): void {

    const section =
        this.missionSection?.nativeElement;

    if (!section) {
        console.warn('Mission section not found');
        return;
    }

    this.missionObserver =
        new IntersectionObserver(
            (
                entries: IntersectionObserverEntry[]
            ) => {

                const entry = entries[0];

                if (!entry?.isIntersecting) {
                    return;
                }

                this.missionObserver?.unobserve(section);

                this.missionTimer =
                    window.setTimeout(() => {

                        section.classList.add(
                            'mission-visible'
                        );

                    }, 100);

            },
            {
                threshold: 0.12,
                rootMargin: '0px 0px -50px 0px'
            }
        );

    this.missionObserver.observe(section);

}

/* =========================
   GALLERY ANIMATION
========================= */

private initializeGalleryAnimation(): void {

    const section =
        this.gallerySection?.nativeElement;

    if (!section) {
        console.warn('Gallery section not found');
        return;
    }

    this.galleryObserver =
        new IntersectionObserver(
            (
                entries: IntersectionObserverEntry[]
            ) => {

                const entry = entries[0];

                if (!entry?.isIntersecting) {
                    return;
                }

                this.galleryObserver?.unobserve(section);

                this.galleryTimer =
                    window.setTimeout(() => {

                        section.classList.add(
                            'gallery-visible'
                        );

                    }, 100);

            },
            {
                threshold: 0.12,
                rootMargin: '0px 0px -50px 0px'
            }
        );

    this.galleryObserver.observe(section);

}
  /* =========================
     CLEANUP
  ========================= */

  ngOnDestroy(): void {

    this.impactObserver?.disconnect();
    this.founderMessageObserver?.disconnect();

    if (this.founderMessageTimer !== undefined) {

      window.clearTimeout(
        this.founderMessageTimer
      );

    }
this.journeyObserver?.disconnect();

if (this.journeyTimer !== undefined) {

    window.clearTimeout(
        this.journeyTimer
    );

}
this.missionObserver?.disconnect();

if (this.missionTimer !== undefined) {

    window.clearTimeout(
        this.missionTimer
    );

}

this.galleryObserver?.disconnect();

if (this.galleryTimer !== undefined) {

    window.clearTimeout(
        this.galleryTimer
    );

}


  }

  

}