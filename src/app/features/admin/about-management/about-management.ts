import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AboutStats
} from '../../../services/about-gallery';
import {
  finalize,
  timeout
} from 'rxjs';

import {
  AboutGalleryImage,
  AboutGalleryService
} from '../../../services/about-gallery';

import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-about-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  
  templateUrl: './about-management.html',
  styleUrl: './about-management.css'
})
export class AboutManagement implements OnInit, OnDestroy {
  aboutStats: AboutStats = {
  daysOfService: 900,
  mealsServed: 1000000,
  peopleServedDaily: 1000
};

isLoadingStats = false;
isSavingStats = false;
statsMessage = '';
statsError = '';

  images: AboutGalleryImage[] = [];

  selectedFiles: File[] = [];
  previewUrls: string[] = [];

  loading = false;
  uploading = false;

  successMessage = '';
  errorMessage = '';

constructor(
  private aboutGalleryService: AboutGalleryService,
  private changeDetectorRef: ChangeDetectorRef,
  
) {}

  ngOnInit(): void {
    this.loadImages();
    this.loadAboutStats();
  }

  ngOnDestroy(): void {
    this.clearPreviewUrls();
  }


  loadImages(): void {
  this.loading = true;
  this.errorMessage = '';

  this.aboutGalleryService
    .getAdminImages()
    .subscribe({
      next: (images: AboutGalleryImage[]) => {
        console.log('ADMIN ABOUT IMAGES:', images);

        this.images = [...images];
        this.loading = false;

        this.changeDetectorRef.detectChanges();
      },
      error: (error: unknown) => {
        console.error(
          'Unable to load admin images:',
          error
        );

        this.errorMessage =
          'Unable to load About Gallery images.';

        this.loading = false;
        this.changeDetectorRef.detectChanges();
      }
    });
}
  onFileSelected(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const files = Array.from(input.files);

    const validImages = files.filter(file =>
      file.type.startsWith('image/')
    );

    if (validImages.length !== files.length) {
      this.errorMessage =
        'Only image files are allowed.';
    } else {
      this.errorMessage = '';
    }

    this.clearPreviewUrls();

    this.selectedFiles = validImages;

    this.previewUrls = validImages.map(file =>
      URL.createObjectURL(file)
    );
  }


  uploadImages(fileInput: HTMLInputElement): void {
  if (this.selectedFiles.length === 0) {
    this.errorMessage =
      'Please select at least one image.';
    return;
  }

  this.uploading = true;
  this.successMessage = '';
  this.errorMessage = '';

  this.aboutGalleryService
    .uploadImages(this.selectedFiles)
    .subscribe({
      next: () => {
        this.uploading = false;

        this.successMessage =
          'Images uploaded successfully.';

        this.selectedFiles = [];
        this.clearPreviewUrls();
        fileInput.value = '';

        this.changeDetectorRef.detectChanges();

        this.loadImages();
      },
      error: (error: unknown) => {
        console.error('Upload error:', error);

        this.uploading = false;

        this.errorMessage =
          'Unable to upload the image.';

        this.changeDetectorRef.detectChanges();
      }
    });
}

  toggleActive(image: AboutGalleryImage): void {
    const newStatus = !image.active;

    this.aboutGalleryService
      .updateActiveStatus(image.id, newStatus)
      .subscribe({
        next: updatedImage => {
          image.active = updatedImage.active;

          this.successMessage =
            image.active
              ? 'Image is now visible on the About page.'
              : 'Image is now hidden from the About page.';

          this.errorMessage = '';
        },
        error: error => {
          console.error(error);

          this.errorMessage =
            'Unable to update image status.';
        }
      });
  }

  saveDisplayOrder(image: AboutGalleryImage): void {
    const order = Number(image.displayOrder);

    if (Number.isNaN(order) || order < 0) {
      this.errorMessage =
        'Display order must be zero or greater.';

      return;
    }

    this.aboutGalleryService
      .updateDisplayOrder(image.id, order)
      .subscribe({
        next: updatedImage => {
          image.displayOrder =
            updatedImage.displayOrder;

          this.successMessage =
            'Display order updated successfully.';

          this.errorMessage = '';

          this.loadImages();
        },
        error: error => {
          console.error(error);

          this.errorMessage =
            'Unable to update display order.';
        }
      });
  }

  deleteImage(image: AboutGalleryImage): void {
    const confirmed = window.confirm(
      `Delete "${image.imageName}"?`
    );

    if (!confirmed) {
      return;
    }

    this.aboutGalleryService
      .deleteImage(image.id)
      .subscribe({
        next: response => {
          this.successMessage = response.message;
          this.errorMessage = '';

          this.images = this.images.filter(
            item => item.id !== image.id
          );
        },
        error: error => {
          console.error(error);

          this.errorMessage =
            'Unable to delete the image.';
        }
      });
  }

  clearSelection(fileInput: HTMLInputElement): void {
    this.selectedFiles = [];
    this.clearPreviewUrls();

    fileInput.value = '';
    this.errorMessage = '';
  }

  trackByImageId(
    index: number,
    image: AboutGalleryImage
  ): number {
    return image.id;
  }

  private clearPreviewUrls(): void {
    this.previewUrls.forEach(url =>
      URL.revokeObjectURL(url)
    );

    this.previewUrls = [];
  }

  loadAboutStats(): void {

  this.isLoadingStats = true;
  this.statsError = '';

  this.aboutGalleryService.getAboutStats().subscribe({
    next: (response) => {
      this.aboutStats = response;
      this.isLoadingStats = false;
    },
    error: (error) => {
      console.error('Unable to load About statistics:', error);

      this.statsError =
        'Unable to load the impact numbers.';

      this.isLoadingStats = false;
    }
  });
}

saveAboutStats(): void {

  if (this.isSavingStats) {
    return;
  }

  this.statsMessage = '';
  this.statsError = '';

  if (
    this.aboutStats.daysOfService < 0 ||
    this.aboutStats.mealsServed < 0 ||
    this.aboutStats.peopleServedDaily < 0
  ) {
    this.statsError =
      'Please enter valid positive numbers.';

    return;
  }

  this.isSavingStats = true;

  this.aboutGalleryService
    .updateAboutStats(this.aboutStats)
    .pipe(
      timeout(30000),

      finalize(() => {
        this.isSavingStats = false;
      })
    )
    .subscribe({

      next: (response: AboutStats) => {

        this.aboutStats = response;

        this.statsMessage =
          'Impact numbers updated successfully.';
      },

      error: (error: HttpErrorResponse | Error) => {

        console.error(
          'Unable to save impact numbers:',
          error
        );

        if (error.name === 'TimeoutError') {
          this.statsError =
            'Backend did not respond. Check whether Render or the local Java server is running.';

          return;
        }

        if (error instanceof HttpErrorResponse) {
          this.statsError =
            error.error?.message ||
            `Unable to save. Server returned ${error.status}.`;

          return;
        }

        this.statsError =
          'Unable to save the impact numbers.';
      }

    });
}



}