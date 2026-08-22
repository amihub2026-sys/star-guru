import {
  Component,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  GalleryService,
  GalleryTopic
} from '../../../services/gallery.service.ts';



@Component({
  selector: 'app-gallery-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './gallery-management.html',
  styleUrl: './gallery-management.css'
})
export class GalleryManagement implements OnInit {

  topics: GalleryTopic[] = [];

  newTopic = {
    topicName: '',
    displayOrder: 0,
    active: true
  };

  selectedFiles:
    Record<number, File[]> = {};

  loading = false;
  creating = false;

  uploadingTopicId: number | null = null;
  savingTopicId: number | null = null;
  deletingTopicId: number | null = null;
  deletingImageKey = '';

  successMessage = '';
  errorMessage = '';

  constructor(
    private galleryService: GalleryService
  ) {}

  ngOnInit(): void {
    this.loadTopics();
  }

  loadTopics(): void {
    this.loading = true;
    this.errorMessage = '';

    this.galleryService
      .getAdminTopics()
      .subscribe({
        next: topics => {
          this.topics = this.sortTopics(topics);
          this.loading = false;
        },
        error: error => {
          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to load gallery topics.'
            );

          this.loading = false;
        }
      });
  }

  createTopic(): void {
    const topicName =
      this.newTopic.topicName.trim();

    if (!topicName) {
      this.showError(
        'Please enter a topic name.'
      );
      return;
    }

    this.creating = true;
    this.clearMessages();

    this.galleryService
      .createTopic({
        topicName,
        displayOrder:
          Number(this.newTopic.displayOrder) || 0,
        active: this.newTopic.active
      })
      .subscribe({
        next: createdTopic => {
          this.topics = this.sortTopics([
            ...this.topics,
            createdTopic
          ]);

          this.newTopic = {
            topicName: '',
            displayOrder: 0,
            active: true
          };

          this.creating = false;

          this.showSuccess(
            'Gallery topic created successfully.'
          );
        },
        error: error => {
          this.creating = false;

          this.showError(
            this.getErrorMessage(
              error,
              'Topic creation failed.'
            )
          );
        }
      });
  }

  updateTopic(topic: GalleryTopic): void {
    const topicName =
      topic.topicName.trim();

    if (!topicName) {
      this.showError(
        'Topic name cannot be empty.'
      );
      return;
    }

    this.savingTopicId = topic.id;
    this.clearMessages();

    this.galleryService
      .updateTopic(topic.id, {
        topicName,
        displayOrder:
          Number(topic.displayOrder) || 0,
        active: topic.active
      })
      .subscribe({
        next: updatedTopic => {
          this.replaceTopic(updatedTopic);
          this.savingTopicId = null;

          this.showSuccess(
            'Topic updated successfully.'
          );
        },
        error: error => {
          this.savingTopicId = null;

          this.showError(
            this.getErrorMessage(
              error,
              'Topic update failed.'
            )
          );
        }
      });
  }

  onFilesSelected(
    event: Event,
    topicId: number
  ): void {

    const input =
      event.target as HTMLInputElement;

    const files = input.files
      ? Array.from(input.files)
      : [];

    const validFiles =
      files.filter(file =>
        file.type.startsWith('image/')
      );

    if (validFiles.length !== files.length) {
      this.showError(
        'Only image files are allowed.'
      );
    }

    this.selectedFiles[topicId] = validFiles;
  }

  uploadImages(topicId: number): void {
    const files =
      this.selectedFiles[topicId] || [];

    if (files.length === 0) {
      this.showError(
        'Please select at least one image.'
      );
      return;
    }

    this.uploadingTopicId = topicId;
    this.clearMessages();

    this.galleryService
      .uploadImages(topicId, files)
      .subscribe({
        next: updatedTopic => {
          this.replaceTopic(updatedTopic);
          this.selectedFiles[topicId] = [];
          this.uploadingTopicId = null;

          this.showSuccess(
            'Images uploaded successfully.'
          );
        },
        error: error => {
          this.uploadingTopicId = null;

          this.showError(
            this.getErrorMessage(
              error,
              'Image upload failed.'
            )
          );
        }
      });
  }

  deleteImage(
    topic: GalleryTopic,
    imageIndex: number
  ): void {

    const confirmed = window.confirm(
      'Do you want to delete this image?'
    );

    if (!confirmed) {
      return;
    }

    const imageKey =
      `${topic.id}-${imageIndex}`;

    this.deletingImageKey = imageKey;
    this.clearMessages();

    this.galleryService
      .deleteImage(topic.id, imageIndex)
      .subscribe({
        next: updatedTopic => {
          this.replaceTopic(updatedTopic);
          this.deletingImageKey = '';

          this.showSuccess(
            'Image deleted successfully.'
          );
        },
        error: error => {
          this.deletingImageKey = '';

          this.showError(
            this.getErrorMessage(
              error,
              'Image deletion failed.'
            )
          );
        }
      });
  }

  deleteTopic(topic: GalleryTopic): void {
    const confirmed = window.confirm(
      `Delete "${topic.topicName}" and all its gallery images?`
    );

    if (!confirmed) {
      return;
    }

    this.deletingTopicId = topic.id;
    this.clearMessages();

    this.galleryService
      .deleteTopic(topic.id)
      .subscribe({
        next: () => {
          this.topics =
            this.topics.filter(
              item => item.id !== topic.id
            );

          this.deletingTopicId = null;

          this.showSuccess(
            'Gallery topic deleted successfully.'
          );
        },
        error: error => {
          this.deletingTopicId = null;

          this.showError(
            this.getErrorMessage(
              error,
              'Topic deletion failed.'
            )
          );
        }
      });
  }

  getTotalImages(): number {
    return this.topics.reduce(
      (total, topic) =>
        total + (topic.imageUrls?.length || 0),
      0
    );
  }

  trackTopic(
    index: number,
    topic: GalleryTopic
  ): number {
    return topic.id;
  }

  trackImage(
    index: number,
    imageUrl: string
  ): string {
    return imageUrl;
  }

  private replaceTopic(
    updatedTopic: GalleryTopic
  ): void {

    this.topics = this.sortTopics(
      this.topics.map(topic =>
        topic.id === updatedTopic.id
          ? updatedTopic
          : topic
      )
    );
  }

  private sortTopics(
    topics: GalleryTopic[]
  ): GalleryTopic[] {

    return [...topics].sort(
      (first, second) =>
        first.displayOrder -
          second.displayOrder ||
        first.id - second.id
    );
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';

    window.setTimeout(() => {
      this.successMessage = '';
    }, 4000);
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
  }

  private getErrorMessage(
    error: any,
    fallbackMessage: string
  ): string {

    return (
      error?.error?.message ||
      error?.error?.detail ||
      error?.error?.error ||
      fallbackMessage
    );
  }
}