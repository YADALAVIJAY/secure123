import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent implements OnInit, OnChanges {
  @Input() title = 'SecureFileShare Security Terminal';
  @Input() logs: string[] = [
    'Initializing security submodules...',
    'Zero Trust access control active',
    'ClamAV antivirus engine online',
    'Ready for encrypted payload transport'
  ];

  displayedLogs: string[] = [];

  ngOnInit(): void {
    this.updateDisplayedLogs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['logs']) {
      this.updateDisplayedLogs();
    }
  }

  private updateDisplayedLogs(): void {
    this.displayedLogs = [...this.logs];
  }
}
