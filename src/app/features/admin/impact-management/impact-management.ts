import {
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  finalize,
  forkJoin
} from 'rxjs';

import {
  ImpactVideo,
  ImpactVideoService
} from '../../../services/impact-video';

@Component({
  selector: 'app-impact-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './impact-management.html',
  styleUrl: './impact-management.css'
})
export class ImpactManagement implements OnInit {

  videos: ImpactVideo[] = [];
  transformations: ImpactVideo[] = [];
  recognitions: ImpactVideo[] = [];

  loading = false;
  uploadingVideo = false;
  uploadingTransformation = false;
  uploadingRecognition = false;

  successMessage = '';
  errorMessage = '';

  /*
   * Video form
   */
  videoFile: File | null = null;
  videoTitle = '';
  videoDescription = '';
  videoDisplayOrder = 0;

  /*
   * Transformation form
   */
  beforeImage: File | null = null;
  afterImage: File | null = null;
  transformationTitle = '';
  transformationDescription = '';
  transformationDisplayOrder = 0;

  /*
   * Recognition form
   */
  recognitionImage: File | null = null;
  recognitionBadgeText = '';
  recognitionTitle = '';
  recognitionDescription = '';
  recognitionDisplayOrder = 0;

  constructor(
    private readonly impactService:
      ImpactVideoService
  ) {}

  ngOnInit(): void {
    this.loadAllItems();
  }

  loadAllItems(): void {
    this.loading = true;
    this.clearMessages();

    forkJoin({
      videos:
        this.impactService.getAdminVideos(),

      transformations:
        this.impactService
          .getAdminTransformations(),

      recognitions:
        this.impactService
          .getAdminRecognitions()
    })
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (result) => {
          this.videos = result.videos;
          this.transformations =
            result.transformations;
          this.recognitions =
            result.recognitions;
        },
        error: (error: unknown) => {
          console.error(
            'Unable to load impact items:',
            error
          );

          this.errorMessage =
            'Unable to load impact items. Check the backend.';
        }
      });
  }

  /*
   * File selection
   */

 onVideoSelected(event: Event): void {

  const input =
    event.target as HTMLInputElement;

  if (this.videos.length >= 3) {
    this.videoFile = null;
    input.value = '';

    this.errorMessage =
      'Maximum three videos are allowed. Delete one video before uploading another.';

    return;
  }

  const file =
    input.files?.[0] ?? null;

  if (!file) {
    this.videoFile = null;
    return;
  }

  const allowedTypes = [
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ];

  if (!allowedTypes.includes(file.type)) {
    this.videoFile = null;
    input.value = '';

    this.errorMessage =
      'Only MP4, WEBM and MOV videos are allowed.';

    return;
  }

  /*
   * Maximum video size: 50 MB
   */
  const maximumSize =
    50 * 1024 * 1024;

  if (file.size > maximumSize) {
    this.videoFile = null;
    input.value = '';

    this.errorMessage =
      'Video must be smaller than 50 MB. Compress the video and try again.';

    return;
  }

  this.videoFile = file;
  this.errorMessage = '';
}

  onBeforeImageSelected(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    this.beforeImage =
      input.files?.[0] ?? null;
  }

  onAfterImageSelected(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    this.afterImage =
      input.files?.[0] ?? null;
  }

 onRecognitionImageSelected(
  event: Event
): void {

  const input =
    event.target as HTMLInputElement;

  const file =
    input.files?.[0] ?? null;

  if (!file) {
    this.recognitionImage = null;
    return;
  }

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  if (!allowedTypes.includes(file.type)) {
    this.errorMessage =
      'Only JPG, PNG and WEBP images are allowed.';

    this.recognitionImage = null;
    input.value = '';

    return;
  }

  /*
   * Maximum 5 MB.
   */
  const maximumSize =
    5 * 1024 * 1024;

  if (file.size > maximumSize) {
    this.errorMessage =
      'Image must be smaller than 5 MB.';

    this.recognitionImage = null;
    input.value = '';

    return;
  }

  this.recognitionImage = file;
  this.errorMessage = '';
}

  /*
   * Upload video
   */

 uploadVideo(
  fileInput: HTMLInputElement
): void {

  if (this.uploadingVideo) {
    return;
  }

  /*
   * Prevent fourth video upload.
   */
  if (this.videos.length >= 3) {
    this.errorMessage =
      'Maximum three videos are already uploaded. Delete one video before uploading another.';

    this.videoFile = null;
    fileInput.value = '';

    return;
  }

  if (!this.videoFile) {
    this.errorMessage =
      'Please select a video.';
    return;
  }

  if (!this.videoTitle.trim()) {
    this.errorMessage =
      'Please enter the video title.';
    return;
  }

  const selectedVideo =
    this.videoFile;

  this.uploadingVideo = true;
  this.successMessage = '';
  this.errorMessage = '';

  this.impactService
    .uploadVideo(
      selectedVideo,
      this.videoTitle.trim(),
      this.videoDescription.trim(),
      Number(this.videoDisplayOrder)
    )
    .pipe(
      finalize(() => {
        /*
         * Always unlock the button.
         */
        this.uploadingVideo = false;
      })
    )
    .subscribe({
      next: (
        uploadedVideo: ImpactVideo
      ) => {

        /*
         * Immediately show the uploaded video.
         */
        this.videos = [
          ...this.videos,
          uploadedVideo
        ].sort(
          (
            first: ImpactVideo,
            second: ImpactVideo
          ) =>
            first.displayOrder -
            second.displayOrder
        );

        this.successMessage =
          'Video uploaded successfully.';

        this.videoFile = null;
        this.videoTitle = '';
        this.videoDescription = '';
        this.videoDisplayOrder = 0;

        fileInput.value = '';
      },

      error: (error: any) => {

        console.error(
          'Video upload failed:',
          error
        );

        if (error.status === 0) {
          this.errorMessage =
            'Backend is not responding.';
        } else if (error.status === 413) {
          this.errorMessage =
            'Video is too large. Compress it and try again.';
        } else {
          this.errorMessage =
            error.error?.message ??
            'Video upload failed. Check Cloudinary and the backend console.';
        }
      }
    });
}

  /*
   * Upload transformation
   */

  uploadTransformation(
    beforeInput: HTMLInputElement,
    afterInput: HTMLInputElement
  ): void {

    if (
      !this.beforeImage ||
      !this.afterImage
    ) {
      this.errorMessage =
        'Please select both before and after images.';
      return;
    }

    if (!this.transformationTitle.trim()) {
      this.errorMessage =
        'Please enter the transformation title.';
      return;
    }

    this.uploadingTransformation = true;
    this.clearMessages();

    this.impactService
      .uploadTransformation(
        this.beforeImage,
        this.afterImage,
        this.transformationTitle.trim(),
        this.transformationDescription.trim(),
        Number(
          this.transformationDisplayOrder
        )
      )
      .pipe(
        finalize(() => {
          this.uploadingTransformation = false;
        })
      )
      .subscribe({
        next: () => {
          this.successMessage =
            'Transformation uploaded successfully.';

          this.beforeImage = null;
          this.afterImage = null;
          this.transformationTitle = '';
          this.transformationDescription = '';
          this.transformationDisplayOrder = 0;

          beforeInput.value = '';
          afterInput.value = '';

          this.loadAllItems();
        },
        error: (error: unknown) => {
          console.error(
            'Transformation upload failed:',
            error
          );

          this.errorMessage =
            'Upload failed. Maximum two transformation cards are allowed.';
        }
      });
  }

  /*
   * Upload recognition
   */

 uploadRecognition(
  fileInput: HTMLInputElement
): void {

  if (this.uploadingRecognition) {
    return;
  }

  if (!this.recognitionImage) {
    this.errorMessage =
      'Please select a recognition image.';
    return;
  }

  if (!this.recognitionTitle.trim()) {
    this.errorMessage =
      'Please enter the recognition title.';
    return;
  }

  if (!this.recognitionBadgeText.trim()) {
    this.errorMessage =
      'Please enter the badge text.';
    return;
  }

  const selectedImage =
    this.recognitionImage;

  this.uploadingRecognition = true;
  this.successMessage = '';
  this.errorMessage = '';

  this.impactService
    .uploadRecognition(
      selectedImage,
      this.recognitionBadgeText.trim(),
      this.recognitionTitle.trim(),
      this.recognitionDescription.trim(),
      Number(
        this.recognitionDisplayOrder
      )
    )
    .pipe(
      finalize(() => {
        /*
         * This always runs on success
         * or error, so the button cannot
         * remain stuck on Uploading.
         */
        this.uploadingRecognition = false;
      })
    )
    .subscribe({
      next: (uploadedItem: ImpactVideo) => {

        /*
         * Immediately display the uploaded
         * item without waiting for Refresh.
         */
        this.recognitions = [
          ...this.recognitions,
          uploadedItem
        ].sort(
          (
            first: ImpactVideo,
            second: ImpactVideo
          ) =>
            first.displayOrder -
            second.displayOrder
        );

        this.successMessage =
          'Recognition uploaded successfully.';

        /*
         * Clear the form only after success.
         */
        this.recognitionImage = null;
        this.recognitionBadgeText = '';
        this.recognitionTitle = '';
        this.recognitionDescription = '';
        this.recognitionDisplayOrder = 0;

        fileInput.value = '';
      },

      error: (error: any) => {
        console.error(
          'Recognition upload failed:',
          error
        );

        if (error.status === 0) {
          this.errorMessage =
            'Backend is not responding. Check whether Spring Boot is running.';
        } else if (error.status === 413) {
          this.errorMessage =
            'The selected image is too large.';
        } else if (error.status === 500) {
          this.errorMessage =
            error.error?.message ??
            'Backend or Cloudinary upload failed.';
        } else {
          this.errorMessage =
            error.error?.message ??
            'Recognition upload failed.';
        }
      }
    });
}

  saveDetails(item: ImpactVideo): void {
    this.clearMessages();

    this.impactService
      .updateDetails(
        item.id,
        item.title.trim(),
        item.description.trim(),
        Number(item.displayOrder)
      )
      .subscribe({
        next: (updatedItem) => {
          item.title = updatedItem.title;
          item.description =
            updatedItem.description;
          item.displayOrder =
            updatedItem.displayOrder;

          this.successMessage =
            'Details updated successfully.';

          this.loadAllItems();
        },
        error: (error: unknown) => {
          console.error(
            'Update failed:',
            error
          );

          this.errorMessage =
            'Unable to update the item.';
        }
      });
  }

  toggleStatus(item: ImpactVideo): void {
    const newStatus = !item.active;

    this.clearMessages();

    this.impactService
      .updateActiveStatus(
        item.id,
        newStatus
      )
      .subscribe({
        next: (updatedItem) => {
          item.active = updatedItem.active;

          this.successMessage =
            item.active
              ? 'Item is now visible.'
              : 'Item is now hidden.';
        },
        error: (error: unknown) => {
          console.error(
            'Status update failed:',
            error
          );

          this.errorMessage =
            'Unable to change the status.';
        }
      });
  }

  deleteItem(item: ImpactVideo): void {
    const confirmed = window.confirm(
      `Delete "${item.title}"?`
    );

    if (!confirmed) {
      return;
    }

    this.clearMessages();

    this.impactService
      .deleteImpact(item.id)
      .subscribe({
        next: (response) => {
          this.successMessage =
            response.message;

          this.loadAllItems();
        },
        error: (error: unknown) => {
          console.error(
            'Delete failed:',
            error
          );

          this.errorMessage =
            'Unable to delete the item.';
        }
      });
  }

  trackById(
    index: number,
    item: ImpactVideo
  ): number {
    return item.id;
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}