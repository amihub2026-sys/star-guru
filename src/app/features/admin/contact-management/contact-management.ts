import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ContactMessage,
  ContactService,
  ContactStatus
} from '../../../services/contact.service';

@Component({
  selector: 'app-contact-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './contact-management.html',
  styleUrl: './contact-management.css'
})
export class ContactManagement
  implements OnInit {

  messages: ContactMessage[] = [];

  loading = false;

  successMessage = '';
  errorMessage = '';

  selectedStatus: 'ALL' | ContactStatus =
    'ALL';

  newMessageCount = 0;

  statusOptions: ContactStatus[] = [
    'NEW',
    'READ',
    'REPLIED',
    'CLOSED'
  ];

  constructor(
    private contactService: ContactService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
  }

  ngOnInit(): void {

    this.loadMessages();
    this.loadNewMessageCount();
  }

  loadMessages(): void {

    this.loading = true;
    this.errorMessage = '';

    const request =
      this.selectedStatus === 'ALL'
        ? this.contactService
            .getAdminMessages()
        : this.contactService
            .getMessagesByStatus(
              this.selectedStatus
            );

    request.subscribe({

      next: (response) => {

        this.ngZone.run(() => {

          this.messages = response;
          this.loading = false;

          this.cdr.detectChanges();
        });
      },

      error: (error) => {

        console.error(
          'Contact messages error:',
          error
        );

        this.ngZone.run(() => {

          this.loading = false;

          this.errorMessage =
            error.error?.message ||
            'Unable to load contact messages.';

          this.cdr.detectChanges();
        });
      }

    });
  }

  loadNewMessageCount(): void {

    this.contactService
      .getNewMessageCount()
      .subscribe({

        next: (response) => {

          this.ngZone.run(() => {

            this.newMessageCount =
              response.count;

            this.cdr.detectChanges();
          });
        },

        error: (error) => {

          console.error(
            'New message count error:',
            error
          );
        }

      });
  }

  filterMessages(): void {
    this.loadMessages();
  }

  updateMessageStatus(
    message: ContactMessage,
    status: ContactStatus
  ): void {

    if (message.status === status) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';

    this.contactService
      .updateStatus(
        message.id,
        status
      )
      .subscribe({

        next: (updated) => {

          this.ngZone.run(() => {

            message.status =
              updated.status;

            this.successMessage =
              'Message status updated successfully.';

            this.loadNewMessageCount();

            if (
              this.selectedStatus !== 'ALL'
            ) {
              this.loadMessages();
            }

            this.cdr.detectChanges();
          });
        },

        error: (error) => {

          this.ngZone.run(() => {

            this.errorMessage =
              error.error?.message ||
              'Unable to update message status.';

            this.loadMessages();
            this.cdr.detectChanges();
          });
        }

      });
  }

  deleteMessage(
    message: ContactMessage
  ): void {

    const confirmed = window.confirm(
      `Delete the message from ${message.fullName}?`
    );

    if (!confirmed) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';

    this.contactService
      .deleteMessage(message.id)
      .subscribe({

        next: () => {

          this.ngZone.run(() => {

            this.successMessage =
              'Contact message deleted successfully.';

            this.loadMessages();
            this.loadNewMessageCount();

            this.cdr.detectChanges();
          });
        },

        error: (error) => {

          this.ngZone.run(() => {

            this.errorMessage =
              error.error?.message ||
              'Unable to delete contact message.';

            this.cdr.detectChanges();
          });
        }

      });
  }

  trackMessage(
    index: number,
    message: ContactMessage
  ): number {

    return message.id;
  }
}