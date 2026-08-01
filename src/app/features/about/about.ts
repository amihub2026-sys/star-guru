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

      this.initializeImpactCounter();
      this.initializeFounderMessageAnimation();

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

          this.startCounters(section);

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

  }

}