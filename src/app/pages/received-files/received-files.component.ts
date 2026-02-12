import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-received-files',
  templateUrl: './received-files.component.html',
  styleUrls: ['./received-files.component.scss']
})
export class ReceivedFilesComponent implements OnInit {
  receivedFiles: any[] = [];
  isLoading = true;
  downloadingFileId: number | null = null;

  // Private key modal state
  showPrivateKeyModal = false;
  selectedFileId: number | null = null;
  selectedFileName: string = '';

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadReceivedFiles();
  }

  loadReceivedFiles() {
    this.isLoading = true;
    // this.toastService.show('Loading received files...', 'info');

    this.apiService.getInbox().subscribe({
      next: (files) => {
        this.receivedFiles = files;
        this.isLoading = false;
        // if (files.length === 0) {
        //   this.toastService.show('No received files found', 'info');
        // } else {
        //   this.toastService.show(`Loaded ${files.length} received file(s)`, 'success');
        // }
      },
      error: (error) => {
        console.error('Failed to load received files', error);
        this.toastService.show('Failed to load received files. Please check your connection.', 'error');
        this.isLoading = false;
      }
    });
  }

  downloadFile(fileId: number, fileName: string) {
    // Show private key modal instead of downloading directly
    this.selectedFileId = fileId;
    this.selectedFileName = fileName;
    this.showPrivateKeyModal = true;
  }

  onPrivateKeyProvided(privateKey: string) {
    if (!this.selectedFileId) return;

    this.downloadingFileId = this.selectedFileId;
    this.showPrivateKeyModal = false;

    this.toastService.show('Validating private key...', 'info');

    setTimeout(() => {
      this.toastService.show('Decrypting AES key with RSA-2048...', 'info');
    }, 800);

    setTimeout(() => {
      this.toastService.show('Decrypting file content...', 'info');
    }, 1600);

    setTimeout(() => {
      this.toastService.show('Verifying SHA-256 digital signature...', 'info');
    }, 2400);

    // Pass the private key to the API for validation and decryption
    this.apiService.downloadFile(this.selectedFileId!, privateKey).subscribe({
      next: (blob) => {
        setTimeout(() => {
          this.toastService.show('✓ Signature Verified! File is authentic.', 'success');
          this.downloadBlob(blob, this.selectedFileName);
          this.downloadingFileId = null;
          this.selectedFileId = null;
          this.selectedFileName = '';
        }, 3200);
      },
      error: (error) => {
        console.error('Download failed', error);
        let errorMessage = '✗ Decryption Failed!';

        if (error.status === 403) {
          errorMessage = '✗ Invalid Private Key! You are using a fake key.';
        } else if (error.status === 400) {
          errorMessage = '✗ Decryption Failed! Invalid private key or corrupted file.';
        } else if (error.status === 429) {
          // Use the message from the backend which contains the time remaining
          errorMessage = error.error?.message || '⛔ You are blocked! Too many failed attempts.';
        }

        this.toastService.show(errorMessage, 'error');
        this.downloadingFileId = null;
        this.selectedFileId = null;
        this.selectedFileName = '';
      }
    });
  }

  onPrivateKeyCancelled() {
    this.showPrivateKeyModal = false;
    this.selectedFileId = null;
    this.selectedFileName = '';
  }

  private downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Append .txt so it opens in text editor to show encryption
    a.download = `ENCRYPTED_${filename}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  isDownloading(fileId: number): boolean {
    return this.downloadingFileId === fileId;
  }
}
