import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import {
  HomeNewsApiService,
  HomeNewsItem
} from '../../../services/home-news.service';

@Component({
  selector: 'app-home-news-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './home-news-management.html',
  styleUrl: './home-news-management.css'
})
export class HomeNewsManagement implements OnInit {

  @ViewChild('fileInput')
  fileInput?: ElementRef<HTMLInputElement>;

  title = '';

  description = '';

  category = '';

  newsDate = '';

  selectedImage: File | null = null;

  imagePreview: string | null = null;

  newsItems: HomeNewsItem[] = [];

  uploading = false;

  deletingId: number | null = null;

  message = '';

  errorMessage = '';

  constructor(
    private newsService: HomeNewsApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {

    this.errorMessage = '';

    this.newsService
      .getAdminNews()
      .subscribe({

        next: (data: HomeNewsItem[]) => {

          this.newsItems = data;

          this.cdr.detectChanges();
        },

        error: (error: any) => {

          console.error(
            'Home News Load Error',
            error
          );

          this.errorMessage =
            'Unable to load News & Events';

          this.cdr.detectChanges();
        }
      });
  }

  selectImage(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    const file = input.files?.[0];

    this.selectedImage = null;

    this.imagePreview = null;

    this.message = '';

    this.errorMessage = '';

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {

      this.errorMessage =
        'Only JPG, PNG and WebP images are allowed';

      input.value = '';

      return;
    }

    if (file.size > 10 * 1024 * 1024) {

      this.errorMessage =
        'Image size must not exceed 10 MB';

      input.value = '';

      return;
    }

    this.selectedImage = file;

    const reader = new FileReader();

    reader.onload = () => {

      if (typeof reader.result === 'string') {

        this.imagePreview = reader.result;

        this.cdr.detectChanges();
      }
    };

    reader.readAsDataURL(file);
  }

  publishNews(): void {

    this.message = '';

    this.errorMessage = '';

    if (!this.title.trim()) {

      this.errorMessage =
        'Please enter the news title';

      return;
    }

    if (!this.category.trim()) {

      this.errorMessage =
        'Please enter the news category';

      return;
    }

    if (!this.newsDate) {

      this.errorMessage =
        'Please select the news date';

      return;
    }

    if (!this.description.trim()) {

      this.errorMessage =
        'Please enter the news description';

      return;
    }

    if (!this.selectedImage) {

      this.errorMessage =
        'Please select a news image';

      return;
    }

    this.uploading = true;

    this.newsService
      .createNews(
        this.selectedImage,
        this.title.trim(),
        this.description.trim(),
        this.category.trim(),
        this.newsDate
      )
      .pipe(
        finalize(() => {

          this.uploading = false;

          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: () => {

          this.message =
            'News published successfully';

          this.resetForm();

          this.loadNews();

          this.cdr.detectChanges();
        },

        error: (error: any) => {

          console.error(
            'Home News Upload Error',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to publish the news';

          this.cdr.detectChanges();
        }
      });
  }

  deleteNews(item: HomeNewsItem): void {

    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.title}"?`
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    this.message = '';

    this.errorMessage = '';

    this.newsService
      .deleteNews(item.id)
      .pipe(
        finalize(() => {

          this.deletingId = null;

          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: () => {

          this.newsItems =
            this.newsItems.filter(
              news => news.id !== item.id
            );

          this.message =
            'News deleted successfully';

          this.cdr.detectChanges();
        },

        error: (error: any) => {

          console.error(
            'Home News Delete Error',
            error
          );

          this.errorMessage =
            'Unable to delete the news';

          this.cdr.detectChanges();
        }
      });
  }

  resetForm(): void {

    this.title = '';

    this.description = '';

    this.category = '';

    this.newsDate = '';

    this.selectedImage = null;

    this.imagePreview = null;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  trackById(
    index: number,
    item: HomeNewsItem
  ): number {

    return item.id;
  }
}