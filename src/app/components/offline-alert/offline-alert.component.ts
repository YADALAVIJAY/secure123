import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-offline-alert',
  templateUrl: './offline-alert.component.html',
  styleUrls: ['./offline-alert.component.scss']
})
export class OfflineAlertComponent {
  @Input() host = 'localhost';
  @Input() port = 3310;
  @Input() errorMessage = 'Unable to connect to the ClamAV antivirus server.';
  
  @Output() retry = new EventEmitter<void>();
  @Output() returnDashboard = new EventEmitter<void>();
}
