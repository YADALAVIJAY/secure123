import { Component, OnInit } from '@angular/core';

interface SecurityEvent {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  message: string;
  details: string;
  time: string;
}

@Component({
  selector: 'app-threat-monitor',
  templateUrl: './threat-monitor.component.html',
  styleUrls: ['./threat-monitor.component.scss']
})
export class ThreatMonitorComponent implements OnInit {
  events: SecurityEvent[] = [
    {
      severity: 'INFO',
      message: 'SOC monitoring active',
      details: 'Threat radar initialized. All sensors nominal.',
      time: new Date().toLocaleTimeString()
    },
    {
      severity: 'INFO',
      message: 'ClamAV daemon online',
      details: 'Listening on port 3310 — signature DB up to date',
      time: new Date().toLocaleTimeString()
    },
    {
      severity: 'INFO',
      message: 'Zero Trust policy enforced',
      details: 'All sessions require token validation per request',
      time: new Date().toLocaleTimeString()
    }
  ];

  severityBadgeMap: Record<string, string> = {
    CRITICAL: 'badge-red',
    HIGH: 'badge-red',
    MEDIUM: 'badge-amber',
    LOW: 'badge-cyan',
    INFO: 'badge-green'
  };

  stats = [
    { label: 'THREATS BLOCKED', value: '0', icon: 'fa-skull', colorClass: 'red' },
    { label: 'FILES SCANNED', value: '—', icon: 'fa-shield-virus', colorClass: 'green' },
    { label: 'ANOMALIES', value: '0', icon: 'fa-exclamation-triangle', colorClass: 'amber' },
    { label: 'UPTIME', value: '100%', icon: 'fa-chart-line', colorClass: 'cyan' },
  ];

  ngOnInit(): void {}

  getSeverityClass(severity: string): string {
    return this.severityBadgeMap[severity] || 'badge-cyan';
  }
}
