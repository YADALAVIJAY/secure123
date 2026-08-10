import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  terminalLogs: string[] = [
    'System initialized :: Zero Trust Protocol Active',
    'ClamAV Engine Daemon :: Ready (Port 3310)',
    'AES-256 / RSA-2048 Cryptographic Handshake :: OK',
    'Real-time IP Threat Blacklisting :: ACTIVE',
    'Awaiting payload transmission...'
  ];

  features = [
    {
      num: '01',
      title: 'CLAMAV MALWARE SCANNING',
      icon: 'fa-shield-virus',
      desc: 'Real-time INSTREAM antivirus socket scanning inspects binary file streams before plaintext persistence or key wrapping occurs.'
    },
    {
      num: '02',
      title: 'AI THREAT DETECTION',
      icon: 'fa-brain',
      desc: 'Intelligent anomaly detection algorithms analyze file entropy, MIME headers, and client upload telemetry to intercept unknown zero-days.'
    },
    {
      num: '03',
      title: 'HYBRID ENCRYPTION',
      icon: 'fa-key',
      desc: 'Combines high-speed AES-256-GCM symmetric payload encryption with RSA-2048 asymmetric key wrapping for ultimate confidentiality.'
    },
    {
      num: '04',
      title: 'ZERO TRUST ACCESS',
      icon: 'fa-user-lock',
      desc: 'Strict identity verification ensures no party can decrypt files without explicit authorization and valid RSA private key credentials.'
    },
    {
      num: '05',
      title: 'BLOCKCHAIN INTEGRITY',
      icon: 'fa-cubes',
      desc: 'Client-side SHA-256 cryptographic hashing guarantees immutable payload verification and tamper prevention across transport.'
    },
    {
      num: '06',
      title: 'IP / USER THREAT BLOCKING',
      icon: 'fa-ban',
      desc: 'Automatic propagation of permanent user account bans and IP address blacklisting upon detection of malicious payloads.'
    }
  ];

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  onStartTransfer(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/upload']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  scrollToSection(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
