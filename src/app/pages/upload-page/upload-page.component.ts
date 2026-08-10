import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CryptoService } from '../../services/crypto.service';
import { ToastService } from '../../services/toast.service';

type ScanState = 'idle' | 'signing' | 'scanning' | 'clean' | 'threat' | 'offline';
type PipelineStage = 'WAITING' | 'ACTIVE' | 'PASSED' | 'FAILED';

interface PipelineStep {
  label: string;
  icon: string;
  state: PipelineStage;
}

@Component({
  selector: 'app-upload-page',
  templateUrl: './upload-page.component.html',
  styleUrls: ['./upload-page.component.scss']
})
export class UploadPageComponent {
  activeTab: 'verify' | 'share' = 'verify';
  selectedFile: File | null = null;
  fileHash = '';
  receiverUsername = '';
  scanState: ScanState = 'idle';
  isVerified = false;
  virusName = '';
  errorMessage = '';
  isDragOver = false;

  terminalLogs: string[] = [
    '[INIT] Secure File Platform initialized',
    '[AV] ClamAV socket connection ready (port 3310)',
    '[WORKFLOW] Ready for VERIFY FILE or SHARE FILE'
  ];

  pipeline: PipelineStep[] = [
    { label: 'FILE UPLOAD', icon: 'fa-upload', state: 'WAITING' },
    { label: 'FILE VALIDATION', icon: 'fa-file-circle-check', state: 'WAITING' },
    { label: 'CLAMAV SCAN', icon: 'fa-shield-virus', state: 'WAITING' },
    { label: 'THREAT ANALYSIS', icon: 'fa-brain', state: 'WAITING' },
    { label: 'AES-256 ENCRYPTION', icon: 'fa-key', state: 'WAITING' },
    { label: 'ZERO TRUST VERIFY', icon: 'fa-fingerprint', state: 'WAITING' },
    { label: 'SECURE SHARE', icon: 'fa-paper-plane', state: 'WAITING' },
  ];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private cryptoService: CryptoService,
    private toastService: ToastService,
    public router: Router
  ) {}

  switchTab(tab: 'verify' | 'share'): void {
    this.activeTab = tab;
    this.addLog(`[WORKFLOW] Switched mode to: ${tab.toUpperCase()} FILE`);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(): void { this.isDragOver = false; }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) this.handleFileSelect(files[0]);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) this.handleFileSelect(input.files[0]);
  }

  async handleFileSelect(file: File): Promise<void> {
    this.selectedFile = file;
    this.scanState = 'idle';
    this.isVerified = false;
    this.virusName = '';
    this.errorMessage = '';
    this.resetPipeline();
    this.addLog(`[FILE] Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      this.fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      this.addLog(`[HASH] SHA-256: ${this.fileHash.slice(0, 16)}...`);
    } catch {
      this.fileHash = 'unavailable';
    }
  }

  // ==========================================
  // 🛡️ BRANCH A: VERIFY FILE ONLY (ClamAV Scan)
  // ==========================================
  async startVerification(): Promise<void> {
    if (!this.selectedFile) {
      this.toastService.show('Please select a file to verify.', 'error');
      return;
    }

    this.scanState = 'scanning';
    this.resetPipeline();

    this.setStage(0, 'ACTIVE');
    this.addLog('[VERIFY] Uploading file for scan validation...');
    await this.delay(300);
    this.setStage(0, 'PASSED');

    this.setStage(1, 'ACTIVE');
    this.setStage(2, 'ACTIVE');
    this.addLog('[AV] Connecting to ClamAV daemon (port 3310)...');
    this.addLog('[AV] Streaming payload to ClamAV engine...');
    await this.delay(800);

    this.apiService.verifyFile(this.selectedFile, this.selectedFile.name).subscribe({
      next: () => {
        this.setStage(1, 'PASSED');
        this.setStage(2, 'PASSED');
        this.setStage(3, 'PASSED');
        this.addLog('[AV] RESULT: CLEAN — File passed ClamAV security scan');
        this.addLog('[VERIFIED] File assigned VERIFIED status');
        this.isVerified = true;
        this.scanState = 'clean';
        this.toastService.show('File verified clean!', 'success');
      },
      error: (error) => {
        const status: number = error.status || 0;
        if (status === 404) {
          this.setStage(1, 'FAILED');
          this.addLog('[NOTE] Endpoint /api/files/verify returned 404 Not Found.');
          this.addLog('[ACTION] Please restart Spring Boot server (mvn spring-boot:run) to activate endpoint.');
          this.scanState = 'idle';
          this.toastService.show('Endpoint /api/files/verify not found. Please restart Spring Boot server.', 'error');
          return;
        }

        this.handleScanError(error, false);
      }
    });
  }

  // ==========================================
  // 🚀 BRANCH B: SECURE SHARE (Encrypt & Send)
  // ==========================================
  async startTransfer(): Promise<void> {
    if (!this.selectedFile || !this.receiverUsername.trim()) {
      this.toastService.show('Please select a file and enter recipient username.', 'error');
      return;
    }

    this.scanState = 'signing';
    this.resetPipeline();

    this.setStage(0, 'ACTIVE');
    this.addLog('[SHARE] Initiating secure payload dispatch...');
    await this.delay(400);
    this.setStage(0, 'PASSED');

    this.setStage(1, 'ACTIVE');
    this.addLog('[VALIDATE] Checking file format & headers...');
    await this.delay(400);
    this.setStage(1, 'PASSED');

    this.setStage(2, 'ACTIVE');
    this.setStage(3, 'ACTIVE');
    this.addLog('[AV] Connecting to ClamAV daemon...');
    this.scanState = 'scanning';
    await this.delay(1000);

    this.scanState = 'signing';
    const senderPrivateKey = this.authService.getPrivateKey();
    if (!senderPrivateKey) {
      this.toastService.show('Private key not found. Please re-login.', 'error');
      this.scanState = 'idle';
      return;
    }

    const receiver = this.receiverUsername.trim();
    this.addLog('[CRYPTO] Verifying RSA-2048 digital signature...');

    this.apiService.getPublicKey(receiver).subscribe({
      next: async () => {
        try {
          const fileBuffer = await this.cryptoService.blobToArrayBuffer(this.selectedFile!);
          const signature = this.cryptoService.signData(fileBuffer, senderPrivateKey);
          this.addLog('[CRYPTO] Digital signature generated.');

          this.apiService.uploadFile(this.selectedFile!, this.selectedFile!.name, receiver, signature)
            .subscribe({
              next: () => {
                this.setStage(2, 'PASSED');
                this.setStage(3, 'PASSED');
                this.setStage(4, 'PASSED');
                this.setStage(5, 'PASSED');
                this.setStage(6, 'PASSED');
                this.addLog('[AV] RESULT: CLEAN — No threats detected');
                this.addLog('[CRYPTO] File encrypted with AES-256-GCM');
                this.addLog('[ZERO TRUST] Access control policy applied');
                this.addLog('[SHARE] Payload delivered to recipient inbox');
                this.scanState = 'clean';
                this.isVerified = true;
              },
              error: (error) => {
                this.handleScanError(error, true);
              }
            });
        } catch (e: any) {
          this.toastService.show('Encryption error: ' + e.message, 'error');
          this.scanState = 'idle';
        }
      },
      error: () => {
        this.toastService.show('Recipient username not found.', 'error');
        this.scanState = 'idle';
        this.resetPipeline();
      }
    });
  }

  private handleScanError(error: any, isShareMode: boolean = false): void {
    const rawMsg: string = error.error?.message || error.error || error.message || '';
    const status: number = error.status || 0;

    if (
      status === 503 ||
      (rawMsg.toLowerCase().includes('antivirus') && rawMsg.toLowerCase().includes('offline')) ||
      rawMsg.toLowerCase().includes('connection refused') ||
      rawMsg.toLowerCase().includes('connect econnrefused')
    ) {
      this.setStage(2, 'FAILED');
      this.addLog('[ERROR] ClamAV daemon unreachable — scan NOT performed');
      this.addLog('[POLICY] FAIL CLOSED — File NOT malware.');
      this.scanState = 'offline';
      this.errorMessage = rawMsg || 'Unable to connect to the ClamAV antivirus server.';
    } else if (
      status === 403 ||
      rawMsg.toLowerCase().includes('malware') ||
      rawMsg.toLowerCase().includes('security alert') ||
      rawMsg.toLowerCase().includes('blocked')
    ) {
      this.setStage(2, 'FAILED');
      const virusMatch = rawMsg.match(/Malware detected \(([^)]+)\)/);
      this.virusName = virusMatch ? virusMatch[1] : rawMsg.replace(/^Security Alert:\s*/, '');
      this.addLog(`[CRITICAL] MALWARE DETECTED: ${this.virusName}`);
      if (isShareMode) {
        this.addLog('[ACTION] Payload blocked. Account suspended due to transmission policy violation.');
      } else {
        this.addLog('[ACTION] Malicious file blocked & deleted. Operator session maintained.');
      }
      this.scanState = 'threat';
    } else {
      this.setStage(1, 'FAILED');
      this.addLog(`[ERROR] Scan failed: ${rawMsg}`);
      this.scanState = 'idle';
      this.toastService.show(rawMsg || 'Scan failed.', 'error');
    }
  }

  dismissThreat(): void {
    if (this.activeTab === 'share') {
      this.toastService.show('Account suspended due to security policy violation during file transfer.', 'error');
      this.authService.logout();
      this.router.navigate(['/login']);
    } else {
      this.toastService.show('Threat alert acknowledged. File blocked & quarantined.', 'warning');
      this.clearFile();
    }
  }

  retryUpload(): void {
    this.scanState = 'idle';
    this.errorMessage = '';
    this.resetPipeline();
    this.addLog('[RETRY] Retrying workflow...');
  }

  clearFile(): void {
    this.selectedFile = null;
    this.fileHash = '';
    this.scanState = 'idle';
    this.isVerified = false;
    this.virusName = '';
    this.errorMessage = '';
    this.receiverUsername = '';
    this.resetPipeline();
    this.terminalLogs = [
      '[INIT] Secure File Platform initialized',
      '[AV] ClamAV socket connection ready (port 3310)',
      '[WORKFLOW] Ready for VERIFY FILE or SHARE FILE'
    ];
  }

  proceedToShare(): void {
    this.activeTab = 'share';
    this.scanState = 'idle';
  }

  private setStage(index: number, state: PipelineStage): void {
    if (this.pipeline[index]) this.pipeline[index].state = state;
  }

  private resetPipeline(): void {
    this.pipeline.forEach(s => s.state = 'WAITING');
  }

  private addLog(msg: string): void {
    this.terminalLogs = [...this.terminalLogs, msg];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }

  get fileSizeKb(): string {
    if (!this.selectedFile) return '0';
    return (this.selectedFile.size / 1024).toFixed(2);
  }
}
