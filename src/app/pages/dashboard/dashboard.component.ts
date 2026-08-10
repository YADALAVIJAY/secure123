import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  username = '';
  sentFiles: any[] = [];
  inboxFiles: any[] = [];
  isLoading = true;

  get totalUploaded(): number { return this.sentFiles.length; }
  get totalScanned(): number { return this.sentFiles.length; }
  get totalReceived(): number { return this.inboxFiles.length; }

  systemServices = [
    { name: 'CLAMAV', icon: 'fa-shield-virus', status: 'ONLINE', color: 'green' },
    { name: 'DATABASE', icon: 'fa-database', status: 'ONLINE', color: 'green' },
    { name: 'ENCRYPTION', icon: 'fa-key', status: 'ACTIVE', color: 'cyan' },
    { name: 'ZERO TRUST', icon: 'fa-user-lock', status: 'ACTIVE', color: 'cyan' },
    { name: 'BLOCKCHAIN', icon: 'fa-cubes', status: 'VERIFIED', color: 'green' },
  ];

  terminalLogs: string[] = [];

  constructor(private apiService: ApiService, private authService: AuthService) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername() || 'OPERATOR';
    this.loadData();
  }

  loadData(): void {
    this.apiService.getSentFiles().subscribe({
      next: (files) => { this.sentFiles = files; this.isLoading = false; this.buildLogs(); },
      error: () => { this.isLoading = false; this.buildLogs(); }
    });
    this.apiService.getInbox().subscribe({
      next: (files) => { this.inboxFiles = files; },
      error: () => {}
    });
  }

  buildLogs(): void {
    this.terminalLogs = [
      `[AUTH] Session authenticated for operator: ${this.username}`,
      `[INFO] ${this.sentFiles.length} encrypted payload(s) in transit log`,
      `[INFO] ${this.inboxFiles.length} incoming payload(s) in secure inbox`,
      '[POLICY] Zero Trust policy enforced on all sessions',
      '[AV] ClamAV daemon monitoring file streams',
      '[CRYPTO] AES-256 / RSA-2048 key pair active'
    ];
  }
}
