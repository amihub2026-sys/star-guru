import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  finalize,
  timeout
} from 'rxjs';

import {
  ImpactVideo,
  ImpactVideoService
} from '../../services/impact-video';

@Component({
  selector: 'app-impact',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './impact.html',
  styleUrl: './impact.css'
})
export class Impact
  implements OnInit, OnDestroy {

  /*
   * ==================================
   * IMPACT VIDEOS
   * ==================================
   */

  impactVideos: ImpactVideo[] = [];

  impactVideosLoading = false;

  impactVideosError = '';

  /*
   * ==================================
   * TRANSFORMATIONS
   * ==================================
   */

  impactTransformations:
    ImpactVideo[] = [];

  /*
   * Alias used by some HTML sections.
   */
  transformations:
    ImpactVideo[] = [];

  transformationsLoading = false;

  transformationsError = '';

  /*
   * ==================================
   * RECOGNITIONS
   * ==================================
   */

  recognitions:
    ImpactVideo[] = [];

  recognitionsLoading = false;

  recognitionsError = '';

  /*
   * ==================================
   * VIDEO MODAL
   * ==================================
   */

  selectedImpactVideo:
    ImpactVideo | null = null;

  constructor(
    private readonly impactVideoService:
      ImpactVideoService,

    private readonly changeDetectorRef:
      ChangeDetectorRef
  ) {}

  /*
   * Runs when the page opens.
   */

  ngOnInit(): void {
    this.loadImpactContent();
  }

  /*
   * Load all sections separately.
   *
   * One failed API will not stop
   * the remaining APIs.
   */

  loadImpactContent(): void {
    this.loadImpactVideos();
    this.loadTransformations();
    this.loadRecognitions();
  }

  /*
   * ==================================
   * LOAD IMPACT VIDEOS
   * ==================================
   */

  loadImpactVideos(): void {

    console.log(
      'Starting public impact video request'
    );

    this.impactVideosLoading = true;
    this.impactVideosError = '';

    this.impactVideoService
      .getActiveVideos()
      .pipe(
        /*
         * Prevent infinite loading.
         */
        timeout(20000),

        finalize(() => {
          this.impactVideosLoading = false;

          this.refreshView();
        })
      )
      .subscribe({
        next: (
          videos: ImpactVideo[]
        ) => {

          console.log(
            'PUBLIC IMPACT VIDEOS:',
            videos
          );

          this.impactVideos =
            Array.isArray(videos)
              ? videos
              : [];

          this.impactVideosError = '';

          this.refreshView();
        },

        error: (error: any) => {

          console.error(
            'IMPACT VIDEO ERROR:',
            error
          );

          this.impactVideos = [];

          if (
            error?.name ===
            'TimeoutError'
          ) {
            this.impactVideosError =
              'Impact video request timed out.';
          } else if (
            error?.status === 0
          ) {
            this.impactVideosError =
              'Cannot connect to the backend. Check Spring Boot and CORS.';
          } else {
            this.impactVideosError =
              `Unable to load impact videos. Status: ${
                error?.status ?? 'Unknown'
              }`;
          }

          this.refreshView();
        }
      });
  }

  /*
   * ==================================
   * LOAD TRANSFORMATIONS
   * ==================================
   */

  loadTransformations(): void {

    console.log(
      'Starting transformation request'
    );

    this.transformationsLoading = true;
    this.transformationsError = '';

    this.impactVideoService
      .getActiveTransformations()
      .pipe(
        timeout(20000),

        finalize(() => {
          this.transformationsLoading =
            false;

          this.refreshView();
        })
      )
      .subscribe({
        next: (
          items: ImpactVideo[]
        ) => {

          console.log(
            'PUBLIC TRANSFORMATIONS:',
            items
          );

          this.impactTransformations =
            Array.isArray(items)
              ? items
              : [];

          /*
           * Keep both names synchronized.
           */
          this.transformations =
            this.impactTransformations;

          this.transformationsError = '';

          this.refreshView();
        },

        error: (error: any) => {

          console.error(
            'TRANSFORMATION ERROR:',
            error
          );

          this.impactTransformations = [];
          this.transformations = [];

          if (
            error?.name ===
            'TimeoutError'
          ) {
            this.transformationsError =
              'Transformation request timed out.';
          } else if (
            error?.status === 0
          ) {
            this.transformationsError =
              'Cannot connect to transformation API.';
          } else {
            this.transformationsError =
              `Unable to load transformations. Status: ${
                error?.status ?? 'Unknown'
              }`;
          }

          this.refreshView();
        }
      });
  }

  /*
   * ==================================
   * LOAD RECOGNITIONS
   * ==================================
   */

  loadRecognitions(): void {

    console.log(
      'Starting recognition request'
    );

    this.recognitionsLoading = true;
    this.recognitionsError = '';

    this.impactVideoService
      .getActiveRecognitions()
      .pipe(
        timeout(20000),

        finalize(() => {
          this.recognitionsLoading =
            false;

          this.refreshView();
        })
      )
      .subscribe({
        next: (
          items: ImpactVideo[]
        ) => {

          console.log(
            'PUBLIC RECOGNITIONS:',
            items
          );

          this.recognitions =
            Array.isArray(items)
              ? items
              : [];

          this.recognitionsError = '';

          this.refreshView();
        },

        error: (error: any) => {

          console.error(
            'RECOGNITION ERROR:',
            error
          );

          this.recognitions = [];

          if (
            error?.name ===
            'TimeoutError'
          ) {
            this.recognitionsError =
              'Recognition request timed out.';
          } else if (
            error?.status === 0
          ) {
            this.recognitionsError =
              'Cannot connect to recognition API.';
          } else {
            this.recognitionsError =
              `Unable to load recognition cards. Status: ${
                error?.status ?? 'Unknown'
              }`;
          }

          this.refreshView();
        }
      });
  }

  /*
   * ==================================
   * OPEN VIDEO MODAL
   * ==================================
   */

  openImpactVideo(
    item: ImpactVideo
  ): void {

    if (!item.videoUrl) {

      console.warn(
        'This impact item has no video URL.'
      );

      return;
    }

    this.selectedImpactVideo = item;

    document.body.style.overflow =
      'hidden';

    this.refreshView();
  }

  /*
   * Alias if HTML uses openVideo(item).
   */

  openVideo(
    item: ImpactVideo
  ): void {
    this.openImpactVideo(item);
  }

  /*
   * Support any remaining old static
   * video cards that pass $event.
   */

  toggleImpactVideo(
    event: Event
  ): void {

    const card =
      event.currentTarget as HTMLElement;

    const video =
      card.querySelector(
        'video'
      ) as HTMLVideoElement | null;

    if (!video) {
      return;
    }

    if (video.paused) {

      video.play().catch(
        (error: unknown) => {
          console.error(
            'Unable to play video:',
            error
          );
        }
      );

    } else {

      video.pause();

    }
  }

  /*
   * ==================================
   * CLOSE VIDEO MODAL
   * ==================================
   */

  closeImpactVideo(): void {

    this.selectedImpactVideo = null;

    document.body.style.overflow = '';

    this.refreshView();
  }

  /*
   * Alias if HTML uses closeVideo().
   */

  closeVideo(): void {
    this.closeImpactVideo();
  }

  /*
   * Close modal only when the dark
   * background itself is clicked.
   */

  closeVideoFromBackdrop(
    event: MouseEvent
  ): void {

    if (
      event.target ===
      event.currentTarget
    ) {
      this.closeImpactVideo();
    }
  }

  /*
   * Alias for alternate HTML method.
   */

  closeFromBackdrop(
    event: MouseEvent
  ): void {
    this.closeVideoFromBackdrop(event);
  }

  /*
   * Close modal with Escape key.
   */

  @HostListener(
    'document:keydown.escape'
  )
  onEscapePressed(): void {
    this.closeImpactVideo();
  }

  /*
   * ==================================
   * CLOUDINARY VIDEO POSTER
   * ==================================
   */

  getImpactPoster(
    videoUrl:
      string |
      null |
      undefined
  ): string {

    if (!videoUrl) {
      return '';
    }

    /*
     * Cloudinary creates a JPG image
     * from the first video frame.
     */

    const posterUrl =
      videoUrl.includes('/upload/')
        ? videoUrl.replace(
            '/upload/',
            '/upload/so_0,f_jpg,q_auto/'
          )
        : videoUrl;

    return posterUrl.replace(
      /\.[^/.?#]+(?=([?#]|$))/,
      '.jpg'
    );
  }

  /*
   * ==================================
   * TRACK BY METHODS
   * ==================================
   */

  trackByImpactVideoId(
    index: number,
    item: ImpactVideo
  ): number {
    return item.id;
  }

  trackById(
    index: number,
    item: ImpactVideo
  ): number {
    return item.id;
  }

  /*
   * Force Angular to refresh fields
   * updated inside HTTP subscriptions.
   */

  private refreshView(): void {

    try {

      this.changeDetectorRef
        .detectChanges();

    } catch (error) {

      console.warn(
        'Change detection skipped:',
        error
      );

    }
  }

  /*
   * Cleanup when leaving page.
   */

  ngOnDestroy(): void {

    document.body.style.overflow = '';

  }
}