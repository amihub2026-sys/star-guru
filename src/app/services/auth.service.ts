import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  adminId: number;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl =
    'http://localhost:8080/api/auth';

  constructor(
    private http: HttpClient
  ) {}


  login(
    credentials: LoginRequest
  ): Observable<LoginResponse> {

    return this.http
      .post<LoginResponse>(
        `${this.apiUrl}/login`,
        credentials
      )
      .pipe(
        tap((response) => {

          localStorage.setItem(
            'admin_logged_in',
            'true'
          );

          localStorage.setItem(
            'admin_id',
            String(response.adminId)
          );

          localStorage.setItem(
            'admin_name',
            response.name
          );

          localStorage.setItem(
            'admin_email',
            response.email
          );
        })
      );
  }


  logout(): void {

    localStorage.removeItem(
      'admin_logged_in'
    );

    localStorage.removeItem(
      'admin_id'
    );

    localStorage.removeItem(
      'admin_name'
    );

    localStorage.removeItem(
      'admin_email'
    );
  }


  isLoggedIn(): boolean {

    return (
      localStorage.getItem(
        'admin_logged_in'
      ) === 'true'
    );
  }


  getAdminName(): string {

    return (
      localStorage.getItem(
        'admin_name'
      ) || 'Admin'
    );
  }


  getAdminEmail(): string {

    return (
      localStorage.getItem(
        'admin_email'
      ) || ''
    );
  }
}