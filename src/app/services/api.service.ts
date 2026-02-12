import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:8088/api/files';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  uploadFile(file: File, receiverUsername: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('receiverUsername', receiverUsername);

    const headers = this.getHeaders();
    // Do NOT manually set Content-Type for FormData, Angular handles it
    return this.http.post(`${this.apiUrl}/upload`, formData, { headers: headers });
  }

  downloadFile(id: number, privateKey: string): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/download/${id}`,
      { privateKey: privateKey },
      { headers: this.getHeaders(), responseType: 'blob' }
    );
  }

  downloadEncryptedFile(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download-encrypted/${id}`,
      { headers: this.getHeaders(), responseType: 'blob' }
    );
  }

  getInbox(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inbox`, { headers: this.getHeaders() });
  }

  getSentFiles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sent`, { headers: this.getHeaders() });
  }

  getUserProfile(): Observable<any> {
    // Note: Profile endpoint is in AuthController, so we use authUrl base
    return this.http.get('http://localhost:8088/api/auth/profile', { headers: this.getHeaders() });
  }

  verifyPassword(password: string): Observable<any> {
    return this.http.post('http://localhost:8088/api/auth/verify-password', { password }, { headers: this.getHeaders() });
  }
}
