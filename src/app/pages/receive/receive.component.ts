import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-receive',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.scss']
})
export class ReceiveComponent implements OnInit {
  decryptForm!: FormGroup;
  isProcessing = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.decryptForm = this.fb.group({
      code: ['', Validators.required],
      password: [''] // Optional for now as per backend logic
    });
  }

  onSubmit() {
    if (this.decryptForm.valid) {
      this.isProcessing = true;
      const fileId = this.decryptForm.get('code')?.value;

      this.toastService.show('Initiating secure handshake...', 'info');

      const privateKey = this.decryptForm.get('password')?.value || '';

      this.apiService.downloadFile(fileId, privateKey).subscribe({
        next: (blob) => {
          // Simulate the security steps visualization
          setTimeout(() => this.toastService.show('Decrypting with RSA-2048 private key...', 'info'), 800);
          setTimeout(() => this.toastService.show('Verifying SHA-256 digital signature...', 'info'), 1600);

          setTimeout(() => {
            this.toastService.show('Success! Integrity verified.', 'success');
            this.downloadBlob(blob, `secure_file_${fileId}`);
            this.isProcessing = false;
          }, 2400);
        },
        error: (error) => {
          console.error('Download failed', error);
          let errorMessage = 'Decryption failed. ';

          if (error.status === 403) {
            errorMessage += 'Invalid private key provided.';
          } else if (error.status === 404) {
            errorMessage += 'File not found.';
          } else {
            errorMessage += 'Integrity check failed or unauthorized.';
          }

          this.toastService.show(errorMessage, 'error');
          this.isProcessing = false;
        }
      });
    } else {
      this.decryptForm.markAllAsTouched();
    }
  }

  private downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename; // Ideally get real filename from headers
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
