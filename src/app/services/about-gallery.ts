import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AboutGalleryImage {
  id: number;
  imageName: string;
  imageUrl: string;
  publicId: string;
  displayOrder: number;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AboutGalleryService {

  private readonly apiUrl =
    'http://localhost:8080/api/about-gallery';

  constructor(private http: HttpClient) {}

  getActiveImages(): Observable<AboutGalleryImage[]> {
    return this.http.get<AboutGalleryImage[]>(
      this.apiUrl
    );
  }

  getAdminImages(): Observable<AboutGalleryImage[]> {
    return this.http.get<AboutGalleryImage[]>(
      `${this.apiUrl}/admin`
    );
  }

  uploadImages(
    files: File[]
  ): Observable<AboutGalleryImage[]> {

    const formData = new FormData();

    files.forEach(file => {
      formData.append('files', file);
    });

    return this.http.post<AboutGalleryImage[]>(
      `${this.apiUrl}/upload`,
      formData
    );
  }

  deleteImage(
    id: number
  ): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${id}`
    );
  }

  updateActiveStatus(
    id: number,
    active: boolean
  ): Observable<AboutGalleryImage> {

    const params = new HttpParams()
      .set('active', active.toString());

    return this.http.put<AboutGalleryImage>(
      `${this.apiUrl}/${id}/status`,
      null,
      { params }
    );
  }

  updateDisplayOrder(
    id: number,
    displayOrder: number
  ): Observable<AboutGalleryImage> {

    const params = new HttpParams()
      .set(
        'displayOrder',
        displayOrder.toString()
      );

    return this.http.put<AboutGalleryImage>(
      `${this.apiUrl}/${id}/order`,
      null,
      { params }
    );
  }
}