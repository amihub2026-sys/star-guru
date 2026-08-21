import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ContactStatus =
  'NEW' |
  'READ' |
  'REPLIED' |
  'CLOSED';

export interface ContactFormData {
  fullName: string;
  mobileNumber: string;
  email: string;
  inquiryType: string;
  subject: string;
  message: string;
}

export interface ContactMessage
  extends ContactFormData {

  id: number;
  status: ContactStatus;
  createdAt: string;
}

export interface ContactSubmitResponse {
  message: string;
  data: ContactMessage;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private readonly apiUrl =
    'https://star-guru-backend.onrender.com/api/contact-messages';

  constructor(
    private http: HttpClient
  ) {
  }

  submitMessage(
    formData: ContactFormData
  ): Observable<ContactSubmitResponse> {

    return this.http.post<ContactSubmitResponse>(
      this.apiUrl,
      formData
    );
  }

  getAdminMessages():
    Observable<ContactMessage[]> {

    return this.http.get<ContactMessage[]>(
      `${this.apiUrl}/admin`
    );
  }

  getMessagesByStatus(
    status: ContactStatus
  ): Observable<ContactMessage[]> {

    return this.http.get<ContactMessage[]>(
      `${this.apiUrl}/admin/status/${status}`
    );
  }

  getNewMessageCount():
    Observable<{ count: number }> {

    return this.http.get<{ count: number }>(
      `${this.apiUrl}/admin/new-count`
    );
  }

  updateStatus(
    id: number,
    status: ContactStatus
  ): Observable<ContactMessage> {

    return this.http.patch<ContactMessage>(
      `${this.apiUrl}/${id}/status`,
      null,
      {
        params: {
          status
        }
      }
    );
  }

  deleteMessage(id: number): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }
}