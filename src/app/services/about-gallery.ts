import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';


/* ABOUT GALLERY IMAGE MODEL */
export interface AboutGalleryImage {
  id: number;
  imageName: string;
  imageUrl: string;
  publicId: string;
  displayOrder: number;
  active: boolean;

  daysOfService: number;
  mealsServed: number;
  peopleServedDaily: number;
}


/* ABOUT IMPACT NUMBERS MODEL */
export interface AboutStats {
  daysOfService: number;
  mealsServed: number;
  peopleServedDaily: number;
}


@Injectable({
  providedIn: 'root'
})
export class AboutGalleryService {

private readonly apiUrl =
  'http://localhost:8080/api/about-gallery';


  constructor(
    private http: HttpClient
  ) {
  }


  /* ================================
     PUBLIC ACTIVE GALLERY IMAGES
     ================================ */

  getActiveImages(): Observable<AboutGalleryImage[]> {

    return this.http.get<AboutGalleryImage[]>(
      this.apiUrl
    );
  }


  /* ================================
     ADMIN GALLERY IMAGES
     ================================ */

  getAdminImages(): Observable<AboutGalleryImage[]> {

    return this.http.get<AboutGalleryImage[]>(
      `${this.apiUrl}/admin`
    );
  }


  /* ================================
     UPLOAD GALLERY IMAGES
     ================================ */

  uploadImages(
    files: File[]
  ): Observable<AboutGalleryImage[]> {

    const formData = new FormData();

    files.forEach((file: File) => {
      formData.append('files', file);
    });

    return this.http.post<AboutGalleryImage[]>(
      `${this.apiUrl}/upload`,
      formData
    );
  }


  /* ================================
     DELETE GALLERY IMAGE
     ================================ */

  deleteImage(
    id: number
  ): Observable<{ message: string }> {

    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${id}`
    );
  }


  /* ================================
     UPDATE ACTIVE STATUS
     ================================ */

  updateActiveStatus(
    id: number,
    active: boolean
  ): Observable<AboutGalleryImage> {

    const params = new HttpParams()
      .set(
        'active',
        active.toString()
      );

    return this.http.put<AboutGalleryImage>(
      `${this.apiUrl}/${id}/status`,
      null,
      { params }
    );
  }


  /* ================================
     UPDATE DISPLAY ORDER
     ================================ */

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


  /* ================================
     GET ABOUT IMPACT NUMBERS
     ================================ */

  getAboutStats(): Observable<AboutStats> {

    return this.http.get<AboutStats>(
      `${this.apiUrl}/stats`
    );
  }


  /* ================================
     UPDATE ABOUT IMPACT NUMBERS
     ================================ */

  updateAboutStats(
    stats: AboutStats
  ): Observable<AboutStats> {

    return this.http.put<AboutStats>(
      `${this.apiUrl}/stats`,
      stats
    );
  }

}