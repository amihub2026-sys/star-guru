import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';

export type ImpactContentType =
  | 'VIDEO'
  | 'TRANSFORMATION'
  | 'RECOGNITION';

export interface ImpactVideo {
  id: number;

  contentType: ImpactContentType;

  title: string;
  description: string;

  displayOrder: number;
  active: boolean;

  // Video
  videoUrl?: string;
  videoPublicId?: string;

  // Transformation
  beforeImageUrl?: string;
  beforePublicId?: string;
  afterImageUrl?: string;
  afterPublicId?: string;

  // Recognition
  recognitionImageUrl?: string;
  recognitionPublicId?: string;
  badgeText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImpactVideoService {

  private readonly apiUrl =
    'https://star-guru-backend.onrender.com/api/impact';

  constructor(
    private readonly http: HttpClient 
  ) {}

  /*
   * ==========================
   * PUBLIC METHODS
   * ==========================
   */

  getActiveVideos(): Observable<ImpactVideo[]> {
    return this.http.get<ImpactVideo[]>(
      this.apiUrl
    );
  }

  getActiveTransformations():
    Observable<ImpactVideo[]> {

    return this.http.get<ImpactVideo[]>(
      `${this.apiUrl}/transformations`
    );
  }

  getActiveRecognitions():
    Observable<ImpactVideo[]> {

    return this.http.get<ImpactVideo[]>(
      `${this.apiUrl}/recognitions`
    );
  }

  /*
   * ==========================
   * ADMIN METHODS
   * ==========================
   */

  getAdminVideos(): Observable<ImpactVideo[]> {
    return this.http.get<ImpactVideo[]>(
      `${this.apiUrl}/admin`
    );
  }

  getAdminTransformations():
    Observable<ImpactVideo[]> {

    return this.http.get<ImpactVideo[]>(
      `${this.apiUrl}/admin/transformations`
    );
  }

  getAdminRecognitions():
    Observable<ImpactVideo[]> {

    return this.http.get<ImpactVideo[]>(
      `${this.apiUrl}/admin/recognitions`
    );
  }

  /*
   * Upload a video.
   */
  uploadVideo(
    video: File,
    title: string,
    description: string,
    displayOrder: number
  ): Observable<ImpactVideo> {

    const formData = new FormData();

    formData.append('video', video);
    formData.append('title', title);
    formData.append('description', description);

    formData.append(
      'displayOrder',
      displayOrder.toString()
    );

    return this.http.post<ImpactVideo>(
      `${this.apiUrl}/upload`,
      formData
    );
  }

  /*
   * Upload before/after transformation.
   */
  uploadTransformation(
    beforeImage: File,
    afterImage: File,
    title: string,
    description: string,
    displayOrder: number
  ): Observable<ImpactVideo> {

    const formData = new FormData();

    formData.append(
      'beforeImage',
      beforeImage
    );

    formData.append(
      'afterImage',
      afterImage
    );

    formData.append('title', title);
    formData.append('description', description);

    formData.append(
      'displayOrder',
      displayOrder.toString()
    );

    return this.http.post<ImpactVideo>(
      `${this.apiUrl}/transformations/upload`,
      formData
    );
  }

  /*
   * Upload recognition card.
   */
  uploadRecognition(
    image: File,
    badgeText: string,
    title: string,
    description: string,
    displayOrder: number
  ): Observable<ImpactVideo> {

    const formData = new FormData();

    formData.append('image', image);
    formData.append('badgeText', badgeText);
    formData.append('title', title);
    formData.append('description', description);

    formData.append(
      'displayOrder',
      displayOrder.toString()
    );

    return this.http.post<ImpactVideo>(
      `${this.apiUrl}/recognitions/upload`,
      formData
    );
  }

  /*
   * Update title, description and order.
   */
  updateDetails(
    id: number,
    title: string,
    description: string,
    displayOrder: number
  ): Observable<ImpactVideo> {

    const params = new HttpParams()
      .set('title', title)
      .set('description', description)
      .set(
        'displayOrder',
        displayOrder.toString()
      );

    return this.http.put<ImpactVideo>(
      `${this.apiUrl}/${id}/details`,
      null,
      { params }
    );
  }

  /*
   * Show or hide an item.
   */
  updateActiveStatus(
    id: number,
    active: boolean
  ): Observable<ImpactVideo> {

    const params = new HttpParams()
      .set('active', active.toString());

    return this.http.put<ImpactVideo>(
      `${this.apiUrl}/${id}/status`,
      null,
      { params }
    );
  }

  /*
   * Delete any impact item.
   */
  deleteImpact(
    id: number
  ): Observable<{ message: string }> {

    return this.http.delete<{
      message: string
    }>(
      `${this.apiUrl}/${id}`
    );
  }
}