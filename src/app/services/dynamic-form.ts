import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DynamicFormField {
  id: string;
  label: string;

  type:
    | 'TEXT'
    | 'TEXTAREA'
    | 'NUMBER'
    | 'PHONE'
    | 'EMAIL'
    | 'DATE'
    | 'TIME'
    | 'DROPDOWN'
    | 'RADIO'
    | 'CHECKBOX'
    | 'IMAGE';

  placeholder?: string;
  required: boolean;
  options?: string[];
}

export interface DynamicForm {
  id?: number;
  title: string;
  description?: string;
  bannerImageUrl?: string;
  buttonText: string;
  fieldsJson: string;
  responsesJson?: string;
  active: boolean;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DynamicFormService {

  private readonly apiUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient
  ) {}

  // =========================
  // PUBLIC
  // =========================

  getActiveForm(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/forms/active`
    );
  }

  submitForm(
    formId: number,
    answers: Record<string, any>
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/forms/${formId}/submit`,
      answers
    );
  }

  // =========================
  // ADMIN
  // =========================

  getAllForms(): Observable<DynamicForm[]> {

    return this.http.get<DynamicForm[]>(
      `${this.apiUrl}/admin/forms`
    );
  }

  getForm(
    id: number
  ): Observable<DynamicForm> {

    return this.http.get<DynamicForm>(
      `${this.apiUrl}/admin/forms/${id}`
    );
  }

  createForm(
    form: DynamicForm
  ): Observable<DynamicForm> {

    return this.http.post<DynamicForm>(
      `${this.apiUrl}/admin/forms`,
      form
    );
  }

  updateForm(
    id: number,
    form: DynamicForm
  ): Observable<DynamicForm> {

    return this.http.put<DynamicForm>(
      `${this.apiUrl}/admin/forms/${id}`,
      form
    );
  }

  changeStatus(
    id: number,
    active: boolean
  ): Observable<DynamicForm> {

    return this.http.patch<DynamicForm>(
      `${this.apiUrl}/admin/forms/${id}/status`,
      { active }
    );
  }

  deleteForm(
    id: number
  ): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/admin/forms/${id}`
    );
  }

  getResponses(
    id: number
  ): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiUrl}/admin/forms/${id}/responses`
    );
  }

  getResponseCount(
    id: number
  ): Observable<{ count: number }> {

    return this.http.get<{ count: number }>(
      `${this.apiUrl}/admin/forms/${id}/responses/count`
    );
  }

  updateResponseStatus(
    formId: number,
    responseId: string,
    status: string
  ): Observable<any> {

    return this.http.patch(
      `${this.apiUrl}/admin/forms/${formId}/responses/${responseId}/status`,
      { status }
    );
  }

  deleteResponse(
    formId: number,
    responseId: string
  ): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/admin/forms/${formId}/responses/${responseId}`
    );
  }
}