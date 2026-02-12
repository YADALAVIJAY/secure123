import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-sent-files',
  templateUrl: './sent-files.component.html',
  styleUrls: ['./sent-files.component.scss']
})
export class SentFilesComponent implements OnInit {
  sentFiles: any[] = [];
  isLoading = true;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadSentFiles();
  }

  loadSentFiles() {
    this.isLoading = true;
    // this.toastService.show('Loading sent files...', 'info');

    this.apiService.getSentFiles().subscribe({
      next: (files) => {
        this.sentFiles = files;
        this.isLoading = false;
        // if (files.length === 0) {
        //   this.toastService.show('No sent files found', 'info');
        // } else {
        //   this.toastService.show(`Loaded ${files.length} sent file(s)`, 'success');
        // }
      },
      error: (error) => {
        console.error('Failed to load sent files', error);
        this.toastService.show('Failed to load sent files. Please check your connection.', 'error');
        this.isLoading = false;
      }
    });
  }

  downloadEncrypted(fileId: number, fileName: string) {
    this.apiService.downloadEncryptedFile(fileId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Append .txt so it opens in text editor to show encryption
        a.download = `ENCRYPTED_${fileName}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.toastService.show('Encrypted file downloaded!', 'success');
      },
      error: () => this.toastService.show('Failed to download encrypted file', 'error')
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}
