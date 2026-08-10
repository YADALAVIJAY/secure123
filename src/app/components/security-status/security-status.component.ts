import { Component, Input } from '@angular/core';

export type SecurityStatusType = 'ONLINE' | 'OFFLINE' | 'SCANNING' | 'BLOCKED' | 'VERIFIED' | 'ERROR' | 'ACTIVE';

@Component({
  selector: 'app-security-status',
  templateUrl: './security-status.component.html',
  styleUrls: ['./security-status.component.scss']
})
export class SecurityStatusComponent {
  @Input() status: SecurityStatusType = 'ONLINE';
  @Input() label = '';
}
