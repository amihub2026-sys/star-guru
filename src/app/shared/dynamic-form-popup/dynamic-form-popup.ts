import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NavigationEnd,
  Router
} from '@angular/router';
import {
  Subscription,
  filter
} from 'rxjs';

import {
  DynamicForm,
  DynamicFormField,
  DynamicFormService
} from '../../services/dynamic-form';


@Component({
  selector: 'app-dynamic-form-popup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './dynamic-form-popup.html',
  styleUrl: './dynamic-form-popup.css'
})
export class DynamicFormPopup implements OnInit, OnDestroy {

  activeForm: DynamicForm | null = null;

  fields: DynamicFormField[] = [];

  answers: Record<string, any> = {};

  showPopup = false;

  loading = false;

  submitting = false;

  successMessage = '';

  errorMessage = '';

  isAdminPage = false;

  isLoginPage = false;

  private routerSubscription?: Subscription;


  constructor(
    private dynamicFormService: DynamicFormService,
    private router: Router
  ) {}


  ngOnInit(): void {

    this.checkRoute(this.router.url);

    if (
      !this.isAdminPage &&
      !this.isLoginPage
    ) {
      this.loadActiveForm();
    }


    this.routerSubscription =
      this.router.events
        .pipe(
          filter(
            event =>
              event instanceof NavigationEnd
          )
        )
        .subscribe((event) => {

          const navigation =
            event as NavigationEnd;

          this.checkRoute(
            navigation.urlAfterRedirects
          );


          if (
            !this.isAdminPage &&
            !this.isLoginPage
          ) {

            this.loadActiveForm();
          }

        });
  }


  ngOnDestroy(): void {

    this.routerSubscription?.unsubscribe();

  }


  private checkRoute(
    url: string
  ): void {

    this.isAdminPage =
      url.startsWith('/admin');

    this.isLoginPage =
      url.startsWith('/login');


    if (
      this.isAdminPage ||
      this.isLoginPage
    ) {

      this.showPopup = false;

    }

  }


  loadActiveForm(): void {

    if (
      this.isAdminPage ||
      this.isLoginPage
    ) {
      return;
    }


    this.loading = true;


    this.dynamicFormService
      .getActiveForm()
      .subscribe({

        next: (form: DynamicForm | null) => {

          this.loading = false;


          if (
            !form ||
            !form.id ||
            form.active === false
          ) {

            this.activeForm = null;

            this.fields = [];

            this.answers = {};

            this.showPopup = false;

            return;

          }


          this.activeForm = form;


          try {

            this.fields =
              JSON.parse(
                form.fieldsJson || '[]'
              );

          } catch (error) {

            console.error(
              'Unable to parse dynamic form fields',
              error
            );

            this.fields = [];

          }


          this.prepareAnswers();


          if (
            this.isHomePage() &&
            !this.isCompleted()
          ) {

            setTimeout(() => {

              if (
                this.isHomePage() &&
                !this.isCompleted()
              ) {

                this.showPopup = true;

              }

            }, 600);

          } else {

            this.showPopup = false;

          }

        },


        error: (error) => {

          console.error(
            'Unable to load active form',
            error
          );

          this.loading = false;

          this.activeForm = null;

          this.fields = [];

          this.showPopup = false;

        }

      });

  }


  private isHomePage(): boolean {

    const currentUrl =
      this.router.url
        .split('?')[0]
        .split('#')[0];


    return (
      currentUrl === '/' ||
      currentUrl === ''
    );

  }


  private prepareAnswers(): void {

    this.answers = {};


    for (const field of this.fields) {

      if (
        field.type === 'CHECKBOX'
      ) {

        this.answers[field.id] = [];

      } else {

        this.answers[field.id] = '';

      }

    }

  }


  openPopup(): void {

    if (!this.activeForm) {
      return;
    }


    this.successMessage = '';

    this.errorMessage = '';

    this.showPopup = true;

  }


  closePopup(): void {

    this.showPopup = false;

    this.errorMessage = '';

  }


  toggleCheckbox(
    fieldId: string,
    option: string,
    event: Event
  ): void {

    const checkbox =
      event.target as HTMLInputElement;


    if (
      !Array.isArray(
        this.answers[fieldId]
      )
    ) {

      this.answers[fieldId] = [];

    }


    if (checkbox.checked) {

      if (
        !this.answers[fieldId]
          .includes(option)
      ) {

        this.answers[fieldId]
          .push(option);

      }

    } else {

      this.answers[fieldId] =
        this.answers[fieldId]
          .filter(
            (value: string) =>
              value !== option
          );

    }

  }


  private validateForm(): boolean {

    this.errorMessage = '';


    for (const field of this.fields) {

      if (!field.required) {
        continue;
      }


      const value =
        this.answers[field.id];


      if (
        Array.isArray(value)
      ) {

        if (
          value.length === 0
        ) {

          this.errorMessage =
            `${field.label} is required.`;

          return false;

        }

      } else if (
        value === undefined ||
        value === null ||
        String(value).trim() === ''
      ) {

        this.errorMessage =
          `${field.label} is required.`;

        return false;

      }

    }


    for (const field of this.fields) {

      if (
        field.type === 'EMAIL'
      ) {

        const value =
          this.answers[field.id];


        if (value) {

          const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


          if (
            !emailPattern.test(
              String(value)
            )
          ) {

            this.errorMessage =
              `Please enter a valid ${field.label}.`;

            return false;

          }

        }

      }

    }


    for (const field of this.fields) {

      if (
        field.type === 'PHONE'
      ) {

        const value =
          this.answers[field.id];


        if (value) {

          const phone =
            String(value)
              .replace(/\D/g, '');


          if (
            phone.length !== 10
          ) {

            this.errorMessage =
              `Please enter a valid 10 digit ${field.label}.`;

            return false;

          }

        }

      }

    }


    return true;

  }


  submitForm(): void {

    if (
      !this.activeForm?.id
    ) {
      return;
    }


    if (this.submitting) {
      return;
    }


    this.successMessage = '';

    this.errorMessage = '';


    if (
      !this.validateForm()
    ) {
      return;
    }


    this.submitting = true;


    this.dynamicFormService
      .submitForm(
        this.activeForm.id,
        this.answers
      )
      .subscribe({

        next: () => {

          this.submitting = false;

          this.successMessage =
            'Form submitted successfully.';


          localStorage.setItem(
            `dynamic_form_completed_${this.activeForm!.id}`,
            'true'
          );


          setTimeout(() => {

            this.showPopup = false;

          }, 1500);

        },


        error: (error) => {

          console.error(
            'Form submission error',
            error
          );


          this.submitting = false;


          this.errorMessage =
            error?.error?.message ||
            'Unable to submit form. Please try again.';

        }

      });

  }


  isCompleted(): boolean {

    if (
      !this.activeForm?.id
    ) {
      return false;
    }


    return (
      localStorage.getItem(
        `dynamic_form_completed_${this.activeForm.id}`
      ) === 'true'
    );

  }


  shouldShowFloatingButton(): boolean {

    return (
      !!this.activeForm &&
      !this.isAdminPage &&
      !this.isLoginPage &&
      !this.showPopup &&
      !this.isCompleted()
    );

  }

}