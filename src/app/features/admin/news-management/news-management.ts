import { CommonModule } from '@angular/common';
import { Component, NgZone,OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';


import {
  NewsCard,
  NewsService
} from '../../../services/news.service';

@Component({
  selector: 'app-news-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './news-management.html',
  styleUrl: './news-management.css'
})
export class NewsManagement implements OnInit {

  newsCards: NewsCard[] = [];

  selectedFile: File | null = null;
  imagePreview: string | null = null;

  editingId: number | null = null;

  loading = false;
  saving = false;

  successMessage = '';
  errorMessage = '';
  eventCards: NewsCard[] = [];

editingEventId: number | null = null;

eventSaving = false;

eventForm = {
  category: '',
  eventDay: 1,
  eventMonth: 'JAN',
  title: '',
  description: '',
  eventTime: '',
  eventLocation: '',
  buttonText: 'Register Now',
  displayOrder: 0,
  active: true
};

  form: NewsCard = this.getEmptyForm();

  mediaCards: NewsCard[] = [];

mediaSelectedFile: File | null = null;
mediaImagePreview: string | null = null;

editingMediaId: number | null = null;

mediaLoading = false;
mediaSaving = false;

mediaForm = this.getEmptyMediaForm();

getEmptyMediaForm() {

  return {
    category: '',
    publishedDate:
      new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    buttonText: 'Read Article',
    buttonLink: '',
    displayOrder: 0,
    active: true
  };
}

constructor(
  private newsService: NewsService,
  private cdr: ChangeDetectorRef,
  private ngZone: NgZone
) {
}

  ngOnInit(): void {

  this.loadNews();
  this.loadEvents();
  this.loadMedia();
}
  getEmptyForm(): NewsCard {
    return {
      category: '',
      publishedDate:
        new Date().toISOString().split('T')[0],
      readTime: '3 min read',
      title: '',
      description: '',
      displayOrder: 0,
      active: true
    };
  }

loadNews(): void {

  this.loading = true;
  this.cdr.detectChanges();

  this.newsService.getAdminNews()
    .subscribe({

      next: (response) => {

        this.ngZone.run(() => {

          this.newsCards = response;
          this.loading = false;

          this.cdr.detectChanges();
        });
      },

      error: (error) => {

        console.error(
          'News loading error:',
          error
        );

        this.ngZone.run(() => {

          this.loading = false;

          this.errorMessage =
            error.error?.message ||
            'Unable to load news cards.';

          this.cdr.detectChanges();
        });
      }

    });
}

  onImageSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.errorMessage =
        'Please select a valid image file.';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage =
        'Image size must be below 5 MB.';
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview =
        reader.result as string;
    };

    reader.readAsDataURL(file);
  }

saveNews(): void {

  this.successMessage = '';
  this.errorMessage = '';

  if (
    !this.form.category.trim() ||
    !this.form.title.trim() ||
    !this.form.description.trim() ||
    !this.form.readTime.trim()
  ) {
    this.errorMessage =
      'Please fill all required fields.';

    this.cdr.detectChanges();
    return;
  }

  if (
    this.editingId === null &&
    !this.selectedFile
  ) {
    this.errorMessage =
      'Please select an image.';

    this.cdr.detectChanges();
    return;
  }

  const formData = new FormData();

  if (this.selectedFile) {
    formData.append(
      'image',
      this.selectedFile
    );
  }

  formData.append(
    'category',
    this.form.category.trim()
  );

  formData.append(
    'publishedDate',
    this.form.publishedDate
  );

  formData.append(
    'readTime',
    this.form.readTime.trim()
  );

  formData.append(
    'title',
    this.form.title.trim()
  );

  formData.append(
    'description',
    this.form.description.trim()
  );

  formData.append(
    'displayOrder',
    String(this.form.displayOrder)
  );

  formData.append(
    'active',
    String(this.form.active)
  );

  this.saving = true;
  this.cdr.detectChanges();

  const request =
    this.editingId === null
      ? this.newsService.createNews(formData)
      : this.newsService.updateNews(
          this.editingId,
          formData
        );



      request.subscribe({

  next: () => {

    this.ngZone.run(() => {

      const wasEditing =
        this.editingEventId !== null;

      this.eventSaving = false;

      this.successMessage =
        wasEditing
          ? 'Event updated successfully.'
          : 'Event uploaded successfully.';

      this.resetEventForm();
      this.loadEvents();

      this.cdr.detectChanges();
    });
  },

  error: (error) => {

    console.error(
      'Event upload error:',
      error
    );

    this.ngZone.run(() => {

      this.eventSaving = false;

      this.errorMessage =
        error.error?.message ||
        'Unable to save event.';

      this.cdr.detectChanges();
    });
  }

});
}

  editNews(news: NewsCard): void {

    if (!news.id) {
      return;
    }

    this.editingId = news.id;

    this.form = {
      category: news.category,
      publishedDate: news.publishedDate,
      readTime: news.readTime,
      title: news.title,
      description: news.description,
      displayOrder: news.displayOrder,
      active: news.active
    };

    this.imagePreview =
      news.imageUrl || null;

    this.selectedFile = null;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  deleteNews(news: NewsCard): void {

    if (!news.id) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${news.title}"?`
    );

    if (!confirmed) {
      return;
    }

    this.newsService.deleteNews(news.id)
      .subscribe({
        next: () => {
          this.successMessage =
            'News card deleted successfully.';

          this.loadNews();
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message ||
            'Unable to delete news card.';
        }
      });
  }

  resetForm(): void {

    this.form = this.getEmptyForm();

    this.selectedFile = null;
    this.imagePreview = null;
    this.editingId = null;

    const fileInput =
      document.getElementById(
        'newsImage'
      ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = '';
    }
  }

  loadEvents(): void {

  this.newsService.getAdminEvents()
    .subscribe({
      next: (response) => {

        this.eventCards = response;
        this.cdr.detectChanges();
      },

      error: (error) => {

        this.errorMessage =
          error.error?.message ||
          'Unable to load events.';

        this.cdr.detectChanges();
      }
    });
}

saveEvent(): void {

  this.errorMessage = '';
  this.successMessage = '';

  const formData = new FormData();

  formData.append(
    'category',
    this.eventForm.category
  );

  formData.append(
    'eventDay',
    String(this.eventForm.eventDay)
  );

  formData.append(
    'eventMonth',
    this.eventForm.eventMonth.toUpperCase()
  );

  formData.append(
    'title',
    this.eventForm.title
  );

  formData.append(
    'description',
    this.eventForm.description
  );

  formData.append(
    'eventTime',
    this.eventForm.eventTime
  );

  formData.append(
    'eventLocation',
    this.eventForm.eventLocation
  );

  formData.append(
    'buttonText',
    this.eventForm.buttonText
  );

  formData.append(
    'displayOrder',
    String(this.eventForm.displayOrder)
  );

  formData.append(
    'active',
    String(this.eventForm.active)
  );

  this.eventSaving = true;

  const request =
    this.editingEventId === null
      ? this.newsService.createEvent(formData)
      : this.newsService.updateEvent(
          this.editingEventId,
          formData
        );

  request.subscribe({
    next: () => {

      this.eventSaving = false;

      this.successMessage =
        'Event saved successfully.';

      this.resetEventForm();
      this.loadEvents();

      this.cdr.detectChanges();
    },

    error: (error) => {

      this.eventSaving = false;

      this.errorMessage =
        error.error?.message ||
        'Unable to save event.';

      this.cdr.detectChanges();
    }
  });
}

editEvent(event: NewsCard): void {

  if (!event.id) {
    return;
  }

  this.editingEventId = event.id;

  this.eventForm = {
    category: event.category,
    eventDay: event.eventDay || 1,
    eventMonth: event.eventMonth || 'JAN',
    title: event.title,
    description: event.description,
    eventTime: event.eventTime || '',
    eventLocation: event.eventLocation || '',
    buttonText:
      event.buttonText || 'Register Now',
    displayOrder: event.displayOrder,
    active: event.active
  };
}

deleteEvent(event: NewsCard): void {

  if (!event.id) {
    return;
  }

  if (!confirm(`Delete "${event.title}"?`)) {
    return;
  }

  this.newsService.deleteNews(event.id)
    .subscribe({
      next: () => {
        this.loadEvents();
        this.cdr.detectChanges();
      },

      error: (error) => {
        this.errorMessage =
          error.error?.message ||
          'Unable to delete event.';

        this.cdr.detectChanges();
      }
    });
}

resetEventForm(): void {

  this.editingEventId = null;

  this.eventForm = {
    category: '',
    eventDay: 1,
    eventMonth: 'JAN',
    title: '',
    description: '',
    eventTime: '',
    eventLocation: '',
    buttonText: 'Register Now',
    displayOrder: 0,
    active: true
  };
}


loadMedia(): void {

  this.mediaLoading = true;

  this.newsService.getAdminMedia()
    .subscribe({

      next: (response) => {

        this.ngZone.run(() => {

          this.mediaCards = response;
          this.mediaLoading = false;

          this.cdr.detectChanges();
        });
      },

      error: (error) => {

        console.error(
          'Media loading error:',
          error
        );

        this.ngZone.run(() => {

          this.mediaLoading = false;

          this.errorMessage =
            error.error?.message ||
            'Unable to load media cards.';

          this.cdr.detectChanges();
        });
      }

    });
}

onMediaImageSelected(
  event: Event
): void {

  const input =
    event.target as HTMLInputElement;

  if (
    !input.files ||
    input.files.length === 0
  ) {
    return;
  }

  const file = input.files[0];

  if (!file.type.startsWith('image/')) {

    this.errorMessage =
      'Please select a valid image.';

    return;
  }

  if (file.size > 5 * 1024 * 1024) {

    this.errorMessage =
      'Image size must be below 5 MB.';

    return;
  }

  this.mediaSelectedFile = file;
  this.errorMessage = '';

  const reader = new FileReader();

  reader.onload = () => {

    this.mediaImagePreview =
      reader.result as string;

    this.cdr.detectChanges();
  };

  reader.readAsDataURL(file);
}

saveMedia(): void {

  this.successMessage = '';
  this.errorMessage = '';

  if (
    !this.mediaForm.category.trim() ||
    !this.mediaForm.title.trim() ||
    !this.mediaForm.description.trim() ||
    !this.mediaForm.buttonText.trim()
  ) {

    this.errorMessage =
      'Please fill all media fields.';

    this.cdr.detectChanges();
    return;
  }

  if (
    this.editingMediaId === null &&
    !this.mediaSelectedFile
  ) {

    this.errorMessage =
      'Please select a media image.';

    this.cdr.detectChanges();
    return;
  }

  const formData = new FormData();

  if (this.mediaSelectedFile) {

    formData.append(
      'image',
      this.mediaSelectedFile
    );
  }

  formData.append(
    'category',
    this.mediaForm.category.trim()
  );

  formData.append(
    'publishedDate',
    this.mediaForm.publishedDate
  );

  formData.append(
    'title',
    this.mediaForm.title.trim()
  );

  formData.append(
    'description',
    this.mediaForm.description.trim()
  );

  formData.append(
    'buttonText',
    this.mediaForm.buttonText.trim()
  );

  formData.append(
    'buttonLink',
    this.mediaForm.buttonLink.trim()
  );

  formData.append(
    'displayOrder',
    String(this.mediaForm.displayOrder)
  );

  formData.append(
    'active',
    String(this.mediaForm.active)
  );

  this.mediaSaving = true;
  this.cdr.detectChanges();

  const request =
    this.editingMediaId === null
      ? this.newsService.createMedia(formData)
      : this.newsService.updateMedia(
          this.editingMediaId,
          formData
        );

  request.subscribe({

    next: () => {

      this.ngZone.run(() => {

        const wasEditing =
          this.editingMediaId !== null;

        this.mediaSaving = false;

        this.successMessage =
          wasEditing
            ? 'Media card updated successfully.'
            : 'Media card uploaded successfully.';

        this.resetMediaForm();
        this.loadMedia();

        this.cdr.detectChanges();
      });
    },

    error: (error) => {

      console.error(
        'Media upload error:',
        error
      );

      this.ngZone.run(() => {

        this.mediaSaving = false;

        this.errorMessage =
          error.error?.message ||
          'Unable to save media card.';

        this.cdr.detectChanges();
      });
    }

  });
}

editMedia(media: NewsCard): void {

  if (!media.id) {
    return;
  }

  this.editingMediaId = media.id;

  this.mediaForm = {
    category: media.category,
    publishedDate:
      media.publishedDate ||
      new Date().toISOString().split('T')[0],
    title: media.title,
    description: media.description,
    buttonText:
      media.buttonText || 'Read More',
    buttonLink:
      media.buttonLink || '',
    displayOrder:
      media.displayOrder || 0,
    active: media.active
  };

  this.mediaImagePreview =
    media.imageUrl || null;

  this.mediaSelectedFile = null;

  this.cdr.detectChanges();
}

deleteMedia(media: NewsCard): void {

  if (!media.id) {
    return;
  }

  const confirmed = window.confirm(
    `Delete "${media.title}"?`
  );

  if (!confirmed) {
    return;
  }

  this.newsService.deleteNews(media.id)
    .subscribe({

      next: () => {

        this.ngZone.run(() => {

          this.successMessage =
            'Media card deleted successfully.';

          this.loadMedia();
          this.cdr.detectChanges();
        });
      },

      error: (error) => {

        this.ngZone.run(() => {

          this.errorMessage =
            error.error?.message ||
            'Unable to delete media card.';

          this.cdr.detectChanges();
        });
      }

    });
}

resetMediaForm(): void {

  this.editingMediaId = null;

  this.mediaForm =
    this.getEmptyMediaForm();

  this.mediaSelectedFile = null;
  this.mediaImagePreview = null;

  const fileInput =
    document.getElementById(
      'mediaImage'
    ) as HTMLInputElement | null;

  if (fileInput) {
    fileInput.value = '';
  }

  this.cdr.detectChanges();
}
}