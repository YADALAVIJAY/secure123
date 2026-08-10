import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  clamavStatus: 'ONLINE' | 'OFFLINE' = 'ONLINE';
  dbStatus: 'ONLINE' | 'OFFLINE' = 'ONLINE';
  mobileMenuOpen = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Initial health status simulation/check
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.toastService.show('Session terminated. Logged out.', 'info');
    this.router.navigate(['/login']);
  }
}
