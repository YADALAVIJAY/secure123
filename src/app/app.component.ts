import { Component, ViewChild } from '@angular/core';
import { SidebarComponent } from './layout/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'SecureFileShare';
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  onToggleSidebar(): void {
    if (this.sidebar) {
      this.sidebar.toggleMobileMenu();
    }
  }
}
