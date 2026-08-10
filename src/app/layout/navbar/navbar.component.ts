import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(
    public authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) { }

  logout(): void {
    this.authService.logout();
    this.toastService.show('Session terminated. Logged out.', 'info');
    this.router.navigate(['/login']);
  }

  getUsername(): string {
    return this.authService.getUsername() || 'GUEST_USER';
  }
}
