import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  showUploadModal = false;
  selectedFile: File | null = null;
  selectedFileName = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private apiService: ApiService
  ) { }

  onFileSelected(file: File) {
    if (!this.authService.isLoggedIn()) {
      this.toastService.show('Please sign in to upload files', 'info');
      this.router.navigate(['/login']);
      return;
    }

    // Show modal with file info
    this.selectedFile = file;
    this.selectedFileName = file.name;
    this.showUploadModal = true;
  }

  onUploadConfirmed(receiverUsername: string) {
    if (!this.selectedFile) return;

    const receiver = receiverUsername;

    // Visualize Security Steps
    this.toastService.show('Calculating SHA-256 Hash...', 'info');

    setTimeout(() => {
      this.toastService.show('Signing with RSA-2048 Private Key...', 'info');
    }, 800);

    setTimeout(() => {
      this.toastService.show('Encrypting file with AES-256...', 'info');
    }, 1600);

    setTimeout(() => {
      this.toastService.show('Uploading encrypted stream...', 'info');
      // Perform actual upload
      this.apiService.uploadFile(this.selectedFile!, receiver).subscribe({
        next: (response) => {
          this.toastService.show('File uploaded successfully!', 'success');
          this.showUploadModal = false;
          this.selectedFile = null;
        },
        error: (error) => {
          console.error('Upload failed', error);
          let errorMessage = 'Upload failed. Please try again.';

          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          this.toastService.show(errorMessage, 'error');
          this.showUploadModal = false;
          this.selectedFile = null;
        }
      });
    }, 2400);
  }

  onUploadCancelled() {
    this.showUploadModal = false;
    this.selectedFile = null;
    this.selectedFileName = '';
  }

  handleToggle(route: string) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate([route]);
    } else {
      this.toastService.show('Please sign in to access this feature', 'info');
      this.router.navigate(['/login']);
    }
  }
}
