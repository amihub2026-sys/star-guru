import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HomeGalleryImage {
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
export class HomeGalleryService {

  private readonly apiUrl =
    'http://localhost:8080/api/home-gallery';

  constructor(private http: HttpClient) {}

  // Public homepage images
  getGallery(): Observable<HomeGalleryImage[]> {

    return this.http.get<HomeGalleryImage[]>(
      this.apiUrl
    );
  }

  // All images for admin
  getAdminGallery(): Observable<HomeGalleryImage[]> {

    return this.http.get<HomeGalleryImage[]>(
      `${this.apiUrl}/admin`
    );
  }

  // Upload multiple images together
uploadImages(files: File[]) {

  const formData = new FormData();

  files.forEach((file: File) => {
    formData.append(
      'files',
      file,
      file.name
    );
  });

  return this.http.post<HomeGalleryImage[]>(
    'http://localhost:8080/api/home-gallery/upload',
    formData
  );

}

  // Delete from Cloudinary and MySQL
  deleteImage(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}




