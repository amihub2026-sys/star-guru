import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import {
  ServiceGalleryImage,
  ServiceGalleryService
} from '../../../services/service-gallery';

@Component({
  selector: 'app-services-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './services-management.html',
  styleUrl: './services-management.css'
})
export class ServicesManagement
  implements OnInit, OnDestroy {

serviceItemId: number | null = 1;

  galleryImages: ServiceGalleryImage[] = [];

  selectedFiles: File[] = [];
  previewUrls: string[] = [];

  loading = false;
  uploading = false;

  successMessage = '';
  errorMessage = '';

  constructor(
    private serviceGalleryService: ServiceGalleryService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

 ngOnInit(): void {
  this.loadServiceGallery();
}

  /*
   * Load gallery using ServiceItem ID.
   */
  loadServiceGallery(): void {
    if (
      this.serviceItemId === null ||
      this.serviceItemId <= 0
    ) {
      this.errorMessage =
        'Please enter a valid Service Item ID.';

      this.galleryImages = [];
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.serviceGalleryService
      .getAdminImages(this.serviceItemId)
      .subscribe({
        next: (images: ServiceGalleryImage[]) => {
          this.galleryImages = [...images];
          this.loading = false;

          this.changeDetectorRef.detectChanges();
        },
        error: (error: unknown) => {
          console.error(
            'Unable to load Service Gallery:',
            error
          );

          this.galleryImages = [];
          this.loading = false;

          this.errorMessage =
            'Unable to load gallery. Check the Service Item ID and backend.';

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  /*
   * Select multiple image files.
   */
  onFilesSelected(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const selectedFiles =
      Array.from(input.files);

    const validFiles = selectedFiles.filter(
      (file: File) =>
        file.type.startsWith('image/')
    );

    if (validFiles.length !== selectedFiles.length) {
      this.errorMessage =
        'Only JPG, PNG and WEBP image files are allowed.';
    } else {
      this.errorMessage = '';
    }

    this.clearPreviewUrls();

    this.selectedFiles = validFiles;

    this.previewUrls = validFiles.map(
      (file: File) =>
        URL.createObjectURL(file)
    );
  }

  /*
   * Upload images for selected ServiceItem.
   */
 uploadImages(fileInput: HTMLInputElement): void {
  const currentServiceItemId = Number(this.serviceItemId);

  if (
    !Number.isInteger(currentServiceItemId) ||
    currentServiceItemId <= 0
  ) {
    this.errorMessage =
      'Please enter a valid Service Item ID before uploading.';
    return;
  }

  if (this.selectedFiles.length === 0) {
    this.errorMessage =
      'Please select at least one image.';
    return;
  }

  this.uploading = true;
  this.successMessage = '';
  this.errorMessage = '';

  this.serviceGalleryService
    .uploadImages(
      currentServiceItemId,
      this.selectedFiles
    )
    .pipe(
      finalize(() => {
        this.uploading = false;
        this.changeDetectorRef.detectChanges();
      })
    )
    .subscribe({
      next: (uploadedImages: ServiceGalleryImage[]) => {
        console.log(
          'UPLOADED SERVICE IMAGES:',
          uploadedImages
        );

        this.selectedFiles = [];
        this.clearPreviewUrls();
        fileInput.value = '';

        this.loadServiceGallery();

        this.successMessage =
          `${uploadedImages.length} image(s) uploaded successfully.`;
      },
      error: (error: unknown) => {
        console.error(
          'Service Gallery upload failed:',
          error
        );

        this.errorMessage =
          'Upload failed. Check the backend terminal for the exact error.';
      }
    });
}

  /*
   * Save an image display order.
   */
  saveDisplayOrder(
    image: ServiceGalleryImage
  ): void {

    const displayOrder =
      Number(image.displayOrder);

    if (
      Number.isNaN(displayOrder) ||
      displayOrder < 0
    ) {
      this.errorMessage =
        'Display order must be zero or greater.';

      return;
    }

    this.serviceGalleryService
      .updateDisplayOrder(
        image.id,
        displayOrder
      )
      .subscribe({
        next: (
          updatedImage: ServiceGalleryImage
        ) => {
          image.displayOrder =
            updatedImage.displayOrder;

          this.successMessage =
            'Display order updated successfully.';

          this.errorMessage = '';

          this.changeDetectorRef.detectChanges();

          this.loadServiceGallery();
        },
        error: (error: unknown) => {
          console.error(
            'Order update failed:',
            error
          );

          this.errorMessage =
            'Unable to update display order.';

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  /*
   * Show or hide an image.
   */
  toggleImageStatus(
    image: ServiceGalleryImage
  ): void {

    const newStatus = !image.active;

    this.serviceGalleryService
      .updateActiveStatus(
        image.id,
        newStatus
      )
      .subscribe({
        next: (
          updatedImage: ServiceGalleryImage
        ) => {
          image.active =
            updatedImage.active;

          this.successMessage =
            updatedImage.active
              ? 'Image is visible on the public service page.'
              : 'Image is hidden from the public service page.';

          this.errorMessage = '';

          this.changeDetectorRef.detectChanges();
        },
        error: (error: unknown) => {
          console.error(
            'Status update failed:',
            error
          );

          this.errorMessage =
            'Unable to update image status.';

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  /*
   * Delete image from Cloudinary and MySQL.
   */
  deleteImage(
    image: ServiceGalleryImage
  ): void {

    const confirmed = window.confirm(
      `Delete "${image.imageName}"?`
    );

    if (!confirmed) {
      return;
    }

    this.serviceGalleryService
      .deleteImage(image.id)
      .subscribe({
        next: (
          response: { message: string }
        ) => {
          this.successMessage =
            response.message;

          this.errorMessage = '';

          this.galleryImages =
            this.galleryImages.filter(
              (item: ServiceGalleryImage) =>
                item.id !== image.id
            );

          this.changeDetectorRef.detectChanges();
        },
        error: (error: unknown) => {
          console.error(
            'Delete failed:',
            error
          );

          this.errorMessage =
            'Unable to delete the image.';

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  clearSelectedFiles(
    fileInput: HTMLInputElement
  ): void {

    this.selectedFiles = [];

    this.clearPreviewUrls();

    fileInput.value = '';

    this.errorMessage = '';
  }

  trackByImageId(
    index: number,
    image: ServiceGalleryImage
  ): number {
    return image.id;
  }

  private clearPreviewUrls(): void {
    this.previewUrls.forEach(
      (url: string) =>
        URL.revokeObjectURL(url)
    );

    this.previewUrls = [];
  }

  ngOnDestroy(): void {
    this.clearPreviewUrls();
  }
}