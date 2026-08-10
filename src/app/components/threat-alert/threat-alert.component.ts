import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-threat-alert',
  templateUrl: './threat-alert.component.html',
  styleUrls: ['./threat-alert.component.scss']
})
export class ThreatAlertComponent {
  @Input() fileName = '';
  @Input() virusName = '';
  @Input() fileSize = 0;
  @Input() scanEngine = 'ClamAV Antivirus v1.0';
  @Input() detectionTime = new Date().toISOString();

  @Output() acknowledge = new EventEmitter<void>();
}
