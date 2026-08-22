import {
  ChangeDetectorRef,
  Component,
  NgZone
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ContactFormData,
  ContactService
} from '../../services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
      RouterLink
  ],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {

  menuOpen = false;

  submitting = false;

  successMessage = '';
  errorMessage = '';

  contactForm: ContactFormData =
    this.getEmptyForm();

  inquiryTypes: string[] = [
    'General Inquiry',
    'Volunteering',
    'Donation',
    'Partnership',
    'Community Program',
    'Media Inquiry',
    'Other'
  ];

  constructor(
    private contactService: ContactService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
  }

  getEmptyForm(): ContactFormData {

    return {
      fullName: '',
      mobileNumber: '',
      email: '',
      inquiryType: '',
      subject: '',
      message: ''
    };
  }

  submitContact(): void {

    this.successMessage = '';
    this.errorMessage = '';

    if (
      !this.contactForm.fullName.trim() ||
      !this.contactForm.mobileNumber.trim() ||
      !this.contactForm.email.trim() ||
      !this.contactForm.inquiryType.trim() ||
      !this.contactForm.subject.trim() ||
      !this.contactForm.message.trim()
    ) {

      this.errorMessage =
        'Please fill all required fields.';

      this.cdr.detectChanges();
      return;
    }

    const mobilePattern =
      /^[0-9+\- ]{7,20}$/;

    if (
      !mobilePattern.test(
        this.contactForm.mobileNumber.trim()
      )
    ) {

      this.errorMessage =
        'Please enter a valid mobile number.';

      this.cdr.detectChanges();
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        this.contactForm.email.trim()
      )
    ) {

      this.errorMessage =
        'Please enter a valid email address.';

      this.cdr.detectChanges();
      return;
    }

    const request: ContactFormData = {

      fullName:
        this.contactForm.fullName.trim(),

      mobileNumber:
        this.contactForm.mobileNumber.trim(),

      email:
        this.contactForm.email
          .trim()
          .toLowerCase(),

      inquiryType:
        this.contactForm.inquiryType,

      subject:
        this.contactForm.subject.trim(),

      message:
        this.contactForm.message.trim()
    };

    this.submitting = true;
    this.cdr.detectChanges();

    this.contactService
      .submitMessage(request)
      .subscribe({

        next: (response) => {

          this.ngZone.run(() => {

            this.submitting = false;

            this.successMessage =
              response.message ||
              'Your message was sent successfully.';

            this.contactForm =
              this.getEmptyForm();

            this.cdr.detectChanges();
          });
        },

        error: (error) => {

          console.error(
            'Contact submission error:',
            error
          );

          this.ngZone.run(() => {

            this.submitting = false;

            this.errorMessage =
              error.error?.message ||
              'Unable to send your message.';

            this.cdr.detectChanges();
          });
        }

      });
  }
}