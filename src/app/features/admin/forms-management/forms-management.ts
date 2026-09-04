import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  DynamicForm,
  DynamicFormField,
  DynamicFormService
} from '../../../services/dynamic-form';

@Component({
  selector: 'app-forms-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './forms-management.html',
  styleUrl: './forms-management.css'
})
export class FormsManagement implements OnInit {

  forms: DynamicForm[] = [];

  loading = false;
  saving = false;

  showBuilder = false;
  showResponses = false;

  editingId: number | null = null;

  successMessage = '';
  errorMessage = '';

  selectedResponses: any[] = [];
  selectedResponseForm: DynamicForm | null = null;

  formModel = {
    title: '',
    description: '',
    bannerImageUrl: '',
    buttonText: 'Submit',
    active: true
  };

  fields: DynamicFormField[] = [];

  fieldTypes = [
    {
      value: 'TEXT',
      label: 'Short Answer'
    },
    {
      value: 'TEXTAREA',
      label: 'Paragraph'
    },
    {
      value: 'NUMBER',
      label: 'Number'
    },
    {
      value: 'PHONE',
      label: 'Phone'
    },
    {
      value: 'EMAIL',
      label: 'Email'
    },
    {
      value: 'DATE',
      label: 'Date'
    },
    {
      value: 'TIME',
      label: 'Time'
    },
    {
      value: 'DROPDOWN',
      label: 'Dropdown'
    },
    {
      value: 'RADIO',
      label: 'Multiple Choice'
    },
    {
      value: 'CHECKBOX',
      label: 'Checkbox'
    },
    {
      value: 'IMAGE',
      label: 'Image Upload'
    }
  ];

  constructor(
    private dynamicFormService: DynamicFormService
  ) {}

  ngOnInit(): void {
    this.loadForms();
  }

  // =============================
  // LOAD FORMS
  // =============================

  loadForms(): void {

    this.loading = true;
    this.errorMessage = '';

    this.dynamicFormService
      .getAllForms()
      .subscribe({

        next: (forms) => {
          this.forms = forms;
          this.loading = false;
        },

        error: (error) => {
          console.error(error);

          this.errorMessage =
            'Unable to load forms.';

          this.loading = false;
        }
      });
  }

  // =============================
  // OPEN CREATE FORM
  // =============================

  openCreateForm(): void {

    this.resetBuilder();

    this.editingId = null;

    this.showBuilder = true;

    this.addField();
  }

  // =============================
  // CLOSE BUILDER
  // =============================

  closeBuilder(): void {

    this.showBuilder = false;

    this.resetBuilder();
  }

  // =============================
  // ADD FIELD
  // =============================

  addField(): void {

    this.fields.push({
      id: this.generateFieldId(),
      label: 'Untitled Question',
      type: 'TEXT',
      placeholder: '',
      required: false,
      options: []
    });
  }

  // =============================
  // REMOVE FIELD
  // =============================

  removeField(index: number): void {

    this.fields.splice(index, 1);
  }

  // =============================
  // MOVE FIELD UP
  // =============================

  moveFieldUp(index: number): void {

    if (index === 0) {
      return;
    }

    const current = this.fields[index];

    this.fields[index] =
      this.fields[index - 1];

    this.fields[index - 1] =
      current;
  }

  // =============================
  // MOVE FIELD DOWN
  // =============================

  moveFieldDown(index: number): void {

    if (
      index >=
      this.fields.length - 1
    ) {
      return;
    }

    const current = this.fields[index];

    this.fields[index] =
      this.fields[index + 1];

    this.fields[index + 1] =
      current;
  }

  // =============================
  // FIELD TYPE CHANGE
  // =============================

  onFieldTypeChange(
    field: DynamicFormField
  ): void {

    if (this.hasOptions(field)) {

      if (
        !field.options ||
        field.options.length === 0
      ) {

        field.options = [
          'Option 1'
        ];
      }

    } else {

      field.options = [];
    }
  }

  // =============================
  // CHECK OPTIONS FIELD
  // =============================

  hasOptions(
    field: DynamicFormField
  ): boolean {

    return (
      field.type === 'DROPDOWN' ||
      field.type === 'RADIO' ||
      field.type === 'CHECKBOX'
    );
  }

  // =============================
  // ADD OPTION
  // =============================

  addOption(
    field: DynamicFormField
  ): void {

    if (!field.options) {
      field.options = [];
    }

    field.options.push(
      `Option ${field.options.length + 1}`
    );
  }

  // =============================
  // REMOVE OPTION
  // =============================

  removeOption(
    field: DynamicFormField,
    index: number
  ): void {

    field.options?.splice(
      index,
      1
    );
  }

  // =============================
  // SAVE FORM
  // =============================

saveForm(): void {

  this.clearMessages();

  // =========================
  // VALIDATION
  // =========================

  if (!this.formModel.title.trim()) {
    this.errorMessage = 'Please enter a form title.';
    return;
  }

  if (this.fields.length === 0) {
    this.errorMessage = 'Please add at least one question.';
    return;
  }

  for (const field of this.fields) {

    if (!field.label.trim()) {
      this.errorMessage =
        'Every question needs a label.';
      return;
    }

    if (
      this.hasOptions(field) &&
      (
        !field.options ||
        field.options.length === 0
      )
    ) {
      this.errorMessage =
        `${field.label} needs at least one option.`;
      return;
    }
  }


  // =========================
  // PAYLOAD
  // =========================

  const payload: DynamicForm = {

    title:
      this.formModel.title.trim(),

    description:
      this.formModel.description.trim(),

    bannerImageUrl:
      this.formModel.bannerImageUrl.trim(),

    buttonText:
      this.formModel.buttonText.trim() ||
      'Submit',

    active:
      this.formModel.active,

    fieldsJson:
      JSON.stringify(this.fields)
  };


  this.saving = true;


  // =========================
  // UPDATE
  // =========================

  if (this.editingId !== null) {

    const id = this.editingId;

    this.dynamicFormService
      .updateForm(id, payload)
      .subscribe({

        next: (updatedForm) => {

          console.log(
            'Form updated:',
            updatedForm
          );

          this.saving = false;

          this.showBuilder = false;

          this.resetBuilder();

          this.successMessage =
            'Form updated successfully.';

          this.loadForms();
        },

        error: (error) => {

          console.error(
            'UPDATE FORM ERROR:',
            error
          );

          this.saving = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to update form.';
        },

        complete: () => {

          console.log(
            'Update request completed'
          );

          this.saving = false;
        }
      });

    return;
  }


  // =========================
  // CREATE
  // =========================

  this.dynamicFormService
    .createForm(payload)
    .subscribe({

      next: (createdForm) => {

        console.log(
          'Form created:',
          createdForm
        );

        this.saving = false;

        this.showBuilder = false;

        this.resetBuilder();

        // Put new form into UI immediately
        if (createdForm) {

          if (createdForm.active) {

            this.forms =
              this.forms.map(form => ({
                ...form,
                active: false
              }));
          }

          this.forms = [
            createdForm,
            ...this.forms
          ];
        }

        this.successMessage =
          'Form created successfully.';


        // Refresh with backend truth
        this.loadForms();
      },

      error: (error) => {

        console.error(
          'CREATE FORM ERROR:',
          error
        );

        this.saving = false;

        this.errorMessage =
          error?.error?.message ||
          'Unable to create form.';
      },

      complete: () => {

        console.log(
          'Create request completed'
        );

        this.saving = false;
      }
    });
}

  // =============================
  // EDIT FORM
  // =============================

  editForm(
    form: DynamicForm
  ): void {

    this.clearMessages();

    this.editingId =
      form.id ?? null;

    this.formModel = {

      title:
        form.title || '',

      description:
        form.description || '',

      bannerImageUrl:
        form.bannerImageUrl || '',

      buttonText:
        form.buttonText || 'Submit',

      active:
        !!form.active
    };

    try {

      this.fields =
        JSON.parse(
          form.fieldsJson || '[]'
        );

    } catch {

      this.fields = [];
    }

    this.showBuilder = true;
  }

  // =============================
  // ACTIVE / DISABLE
  // =============================

  toggleFormStatus(
    form: DynamicForm
  ): void {

    if (!form.id) {
      return;
    }

    const newStatus =
      !form.active;

    this.dynamicFormService
      .changeStatus(
        form.id,
        newStatus
      )
      .subscribe({

        next: () => {

          this.successMessage =
            newStatus
              ? 'Form activated successfully.'
              : 'Form disabled successfully.';

          this.loadForms();
        },

        error: (error) => {

          console.error(error);

          this.errorMessage =
            'Unable to change form status.';
        }
      });
  }

  // =============================
  // DELETE FORM
  // =============================

  deleteForm(
    form: DynamicForm
  ): void {

    if (!form.id) {
      return;
    }

    const confirmed =
      confirm(
        `Are you sure you want to delete "${form.title}"?`
      );

    if (!confirmed) {
      return;
    }

    this.dynamicFormService
      .deleteForm(form.id)
      .subscribe({

        next: () => {

          this.successMessage =
            'Form deleted successfully.';

          this.loadForms();
        },

        error: (error) => {

          console.error(error);

          this.errorMessage =
            'Unable to delete form.';
        }
      });
  }

  // =============================
  // VIEW RESPONSES
  // =============================

  viewResponses(
    form: DynamicForm
  ): void {

    if (!form.id) {
      return;
    }

    this.selectedResponseForm =
      form;

    this.dynamicFormService
      .getResponses(form.id)
      .subscribe({

        next: (responses) => {

          this.selectedResponses =
            responses;

          this.showResponses =
            true;
        },

        error: (error) => {

          console.error(error);

          this.errorMessage =
            'Unable to load responses.';
        }
      });
  }

  // =============================
  // CLOSE RESPONSES
  // =============================

  closeResponses(): void {

    this.showResponses = false;

    this.selectedResponses = [];

    this.selectedResponseForm = null;
  }

  // =============================
  // DELETE RESPONSE
  // =============================

  deleteResponse(
    response: any
  ): void {

    if (
      !this.selectedResponseForm?.id
    ) {
      return;
    }

    const confirmed =
      confirm(
        'Delete this response?'
      );

    if (!confirmed) {
      return;
    }

    const formId =
      this.selectedResponseForm.id;

    this.dynamicFormService
      .deleteResponse(
        formId,
        response.responseId
      )
      .subscribe({

        next: () => {

          if (this.selectedResponseForm) {
            this.viewResponses(
              this.selectedResponseForm
            );
          }
        },

        error: (error) => {

          console.error(error);

          this.errorMessage =
            'Unable to delete response.';
        }
      });
  }

  // =============================
  // ANSWER DISPLAY
  // =============================

  getAnswerEntries(
    response: any
  ): Array<{
    key: string;
    value: any;
  }> {

    if (!response?.answers) {
      return [];
    }

    return Object.keys(
      response.answers
    ).map((key) => ({
      key,
      value: response.answers[key]
    }));
  }

  // =============================
  // PARSE FORM FIELDS
  // =============================

  parseFields(
    form: DynamicForm
  ): DynamicFormField[] {

    try {

      return JSON.parse(
        form.fieldsJson || '[]'
      );

    } catch {

      return [];
    }
  }

  // =============================
  // GENERATE FIELD ID
  // =============================

  private generateFieldId(): string {

    return (
      'field_' +
      Date.now() +
      '_' +
      Math.floor(
        Math.random() * 10000
      )
    );
  }

  // =============================
  // RESET
  // =============================

  private resetBuilder(): void {

    this.formModel = {
      title: '',
      description: '',
      bannerImageUrl: '',
      buttonText: 'Submit',
      active: true
    };

    this.fields = [];

    this.editingId = null;
  }

  // =============================
  // CLEAR MESSAGES
  // =============================

  private clearMessages(): void {

    this.successMessage = '';

    this.errorMessage = '';
  }
}