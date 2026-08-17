import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import {
  HomeGalleryImage,
  HomeGalleryService
} from '../../../services/home-gallery.service';

import {
  HomeNewsManagement
} from '../home-news-management/home-news-management';

@Component({
  selector: 'app-home-management',
  standalone: true,
  imports: [
    CommonModule,
    HomeNewsManagement
  ],
  templateUrl: './home-management.html',
  styleUrl: './home-management.css'
})
export class HomeManagement implements OnInit {

  @ViewChild('galleryFileInput')
  galleryFileInput?: ElementRef<HTMLInputElement>;

  selectedFiles: File[] = [];

  previewImages: string[] = [];

  galleryImages: HomeGalleryImage[] = [];

  uploading = false;

  successMessage = '';

  errorMessage = '';

  constructor(
    private homeGalleryService: HomeGalleryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadGalleryImages();
  }

  loadGalleryImages(): void {

    this.homeGalleryService
      .getGallery()
      .subscribe({

        next: (data: HomeGalleryImage[]) => {

          console.log(
            'Admin Home Gallery Images',
            data
          );

          this.galleryImages = data;

          this.cdr.detectChanges();

        },

        error: (error: unknown) => {

          console.error(
            'Home Gallery Load Error',
            error
          );

          this.errorMessage =
            'Unable to load the gallery images.';

          this.cdr.detectChanges();

        }

      });

  }

  selectImages(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    const files =
      Array.from(input.files ?? []);

    this.selectedFiles = [];

    this.previewImages = [];

    this.successMessage = '';

    this.errorMessage = '';

    if (files.length === 0) {
      return;
    }

    files.forEach((file: File) => {

      if (!file.type.startsWith('image/')) {

        this.errorMessage =
          'Please select image files only.';

        return;

      }

      const maximumFileSize =
        10 * 1024 * 1024;

      if (file.size > maximumFileSize) {

        this.errorMessage =
          `${file.name} is larger than 10 MB.`;

        return;

      }

      this.selectedFiles.push(file);

      const reader = new FileReader();

      reader.onload = (): void => {

        if (typeof reader.result === 'string') {

          this.previewImages.push(
            reader.result
          );

          this.cdr.detectChanges();

        }

      };

      reader.readAsDataURL(file);

    });

  }

  removeSelectedImage(index: number): void {

    this.selectedFiles.splice(index, 1);

    this.previewImages.splice(index, 1);

    if (this.selectedFiles.length === 0) {

      if (this.galleryFileInput) {
        this.galleryFileInput.nativeElement.value = '';
      }

    }

  }

uploadImages(): void {

  if (
    this.uploading ||
    this.selectedFiles.length === 0
  ) {

    this.errorMessage =
      'Please select at least one image.';

    return;

  }

  this.uploading = true;

  this.successMessage = '';

  this.errorMessage = '';

  this.homeGalleryService
    .uploadImages(this.selectedFiles)
    .pipe(
      finalize(() => {

        this.uploading = false;

        this.cdr.detectChanges();

      })
    )
    .subscribe({

      next: () => {

        this.successMessage =
          'Images uploaded successfully.';

        this.selectedFiles = [];

        this.previewImages = [];

        if (this.galleryFileInput) {
          this.galleryFileInput.nativeElement.value = '';
        }

        this.loadGalleryImages();

        this.cdr.detectChanges();

      },

      error: (error: unknown) => {

        console.error(
          'Home Gallery Upload Error',
          error
        );

        this.errorMessage =
          'Image upload failed. Please try again.';

        this.cdr.detectChanges();

      }

    });

}

  trackGalleryImage(
    index: number,
    image: HomeGalleryImage
  ): number {

    return image.id ?? index;

  }

}