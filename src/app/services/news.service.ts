import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NewsCard {
  id?: number;

  contentType?: 'NEWS' | 'EVENT' | 'MEDIA';

  category: string;
  title: string;
  description: string;

  publishedDate: string;
  readTime: string;

  imageUrl?: string;
  imagePublicId?: string;

  displayOrder: number;
  active: boolean;

  eventDay?: number;
  eventMonth?: string;
  eventTime?: string;
  eventLocation?: string;

  buttonText?: string;
  buttonLink?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  private readonly apiUrl =
    'http://localhost:8080/api/news';

  constructor(
    private http: HttpClient
  ) {
  }

  /* ==============================
               NEWS
  ============================== */

  getPublicNews(): Observable<NewsCard[]> {

    return this.http.get<NewsCard[]>(
      this.apiUrl
    );
  }

  getAdminNews(): Observable<NewsCard[]> {

    return this.http.get<NewsCard[]>(
      `${this.apiUrl}/admin`
    );
  }

  createNews(
    formData: FormData
  ): Observable<NewsCard> {

    return this.http.post<NewsCard>(
      this.apiUrl,
      formData
    );
  }

  updateNews(
    id: number,
    formData: FormData
  ): Observable<NewsCard> {

    return this.http.put<NewsCard>(
      `${this.apiUrl}/${id}`,
      formData
    );
  }

  /* ==============================
              EVENTS
  ============================== */

  getPublicEvents(): Observable<NewsCard[]> {

    return this.http.get<NewsCard[]>(
      `${this.apiUrl}/events`
    );
  }

  getAdminEvents(): Observable<NewsCard[]> {

    return this.http.get<NewsCard[]>(
      `${this.apiUrl}/events/admin`
    );
  }

  createEvent(
    formData: FormData
  ): Observable<NewsCard> {

    return this.http.post<NewsCard>(
      `${this.apiUrl}/events`,
      formData
    );
  }

  updateEvent(
    id: number,
    formData: FormData
  ): Observable<NewsCard> {

    return this.http.put<NewsCard>(
      `${this.apiUrl}/events/${id}`,
      formData
    );
  }

  /* ==============================
          FEATURED MEDIA
  ============================== */

  getPublicMedia(): Observable<NewsCard[]> {

    return this.http.get<NewsCard[]>(
      `${this.apiUrl}/media`
    );
  }

  getAdminMedia(): Observable<NewsCard[]> {

    return this.http.get<NewsCard[]>(
      `${this.apiUrl}/media/admin`
    );
  }

  createMedia(
    formData: FormData
  ): Observable<NewsCard> {

    return this.http.post<NewsCard>(
      `${this.apiUrl}/media`,
      formData
    );
  }

  updateMedia(
    id: number,
    formData: FormData
  ): Observable<NewsCard> {

    return this.http.put<NewsCard>(
      `${this.apiUrl}/media/${id}`,
      formData
    );
  }

  /* ==============================
               DELETE
  ============================== */

  deleteNews(id: number): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }
}