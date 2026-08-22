import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GalleryTopic {
  id: number;
  topicName: string;
  displayOrder: number;
  active: boolean;
  imageUrls: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGalleryTopic {
  topicName: string;
  displayOrder: number;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GalleryService {

  private readonly apiUrl =
    'https://star-guru-backend.onrender.com/api/gallery';


  constructor(private http: HttpClient) {}

  // Public user gallery
  getActiveTopics(): Observable<GalleryTopic[]> {
    return this.http.get<GalleryTopic[]>(
      this.apiUrl
    );
  }

  // Admin gallery
  getAdminTopics(): Observable<GalleryTopic[]> {
    return this.http.get<GalleryTopic[]>(
      `${this.apiUrl}/admin`
    );
  }

  getTopicById(id: number): Observable<GalleryTopic> {
    return this.http.get<GalleryTopic>(
      `${this.apiUrl}/${id}`
    );
  }

  createTopic(
    data: CreateGalleryTopic
  ): Observable<GalleryTopic> {

    const params = new HttpParams()
      .set('topicName', data.topicName)
      .set('displayOrder', data.displayOrder.toString())
      .set('active', data.active.toString());

    return this.http.post<GalleryTopic>(
      `${this.apiUrl}/topics`,
      null,
      { params }
    );
  }

  updateTopic(
    id: number,
    data: Partial<CreateGalleryTopic>
  ): Observable<GalleryTopic> {

    let params = new HttpParams();

    if (data.topicName !== undefined) {
      params = params.set(
        'topicName',
        data.topicName
      );
    }

    if (data.displayOrder !== undefined) {
      params = params.set(
        'displayOrder',
        data.displayOrder.toString()
      );
    }

    if (data.active !== undefined) {
      params = params.set(
        'active',
        data.active.toString()
      );
    }

    return this.http.put<GalleryTopic>(
      `${this.apiUrl}/topics/${id}`,
      null,
      { params }
    );
  }

  uploadImages(
    topicId: number,
    files: File[]
  ): Observable<GalleryTopic> {

    const formData = new FormData();

    files.forEach(file => {
      formData.append('files', file);
    });

    return this.http.post<GalleryTopic>(
      `${this.apiUrl}/topics/${topicId}/images`,
      formData
    );
  }

  deleteImage(
    topicId: number,
    imageIndex: number
  ): Observable<GalleryTopic> {

    return this.http.delete<GalleryTopic>(
      `${this.apiUrl}/topics/${topicId}/images/${imageIndex}`
    );
  }

  deleteTopic(
    topicId: number
  ): Observable<{
    success: boolean;
    message: string;
    topicId: number;
  }> {
    return this.http.delete<{
      success: boolean;
      message: string;
      topicId: number;
    }>(
      `${this.apiUrl}/topics/${topicId}`
    );
  }
}