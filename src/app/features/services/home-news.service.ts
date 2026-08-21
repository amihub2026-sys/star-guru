import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HomeNewsItem {
  id: number;
  title: string;
  description: string;
  category: string;
  newsDate: string;
  imageName: string;
  imageUrl: string;
  publicId: string;
  displayOrder: number;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HomeNewsApiService {

  private readonly apiUrl =
    'https://star-guru-backend.onrender.com/api/home-news';

  constructor(private http: HttpClient) {}

  getPublicNews(): Observable<HomeNewsItem[]> {

    return this.http.get<HomeNewsItem[]>(
      this.apiUrl
    );
  }

  getAdminNews(): Observable<HomeNewsItem[]> {

    return this.http.get<HomeNewsItem[]>(
      `${this.apiUrl}/admin`
    );
  }

  createNews(
    image: File,
    title: string,
    description: string,
    category: string,
    newsDate: string
  ): Observable<HomeNewsItem> {

    const formData = new FormData();

    formData.append('image', image);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('newsDate', newsDate);

    return this.http.post<HomeNewsItem>(
      this.apiUrl,
      formData
    );
  }

  deleteNews(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}