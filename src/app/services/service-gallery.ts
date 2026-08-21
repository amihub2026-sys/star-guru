import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ServiceGalleryImage {
  id: number;
  serviceItemId: number;
  imageName: string;
  imageUrl: string;
  publicId: string;
  displayOrder: number;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceGalleryService {

  private readonly apiUrl =
    'https://star-guru-backend.onrender.com/api/service-gallery';

  constructor(private http: HttpClient) {}

  // Public page
getActiveImages(serviceItemId: number): Observable<ServiceGalleryImage[]> {
  return this.http.get<ServiceGalleryImage[]>(
    `https://star-guru-backend.onrender.com/api/service-gallery/service/${serviceItemId}`
  );
}

  // Admin page
  getAdminImages(
    serviceItemId: number
  ): Observable<ServiceGalleryImage[]> {
    return this.http.get<ServiceGalleryImage[]>(
      `${this.apiUrl}/admin/service/${serviceItemId}`
    );
  }

  getAllActiveImages(): Observable<ServiceGalleryImage[]> {
  return this.http.get<ServiceGalleryImage[]>(
    'https://star-guru-backend.onrender.com/api/service-gallery'
  );
}



  uploadImages(
    serviceItemId: number,
    files: File[]
  ): Observable<ServiceGalleryImage[]> {

    const formData = new FormData();

    files.forEach((file: File) => {
      formData.append('files', file);
    });

    return this.http.post<ServiceGalleryImage[]>(
      `${this.apiUrl}/service/${serviceItemId}/upload`,
      formData
    );
  }

  updateDisplayOrder(
    imageId: number,
    displayOrder: number
  ): Observable<ServiceGalleryImage> {

    const params = new HttpParams()
      .set(
        'displayOrder',
        displayOrder.toString()
      );

    return this.http.put<ServiceGalleryImage>(
      `${this.apiUrl}/${imageId}/order`,
      null,
      { params }
    );
  }

  updateActiveStatus(
    imageId: number,
    active: boolean
  ): Observable<ServiceGalleryImage> {

    const params = new HttpParams()
      .set('active', active.toString());

    return this.http.put<ServiceGalleryImage>(
      `${this.apiUrl}/${imageId}/status`,
      null,
      { params }
    );
  }

  deleteImage(
    imageId: number
  ): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${imageId}`
    );
  }
}