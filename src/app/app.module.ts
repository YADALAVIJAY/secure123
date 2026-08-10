import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule, DecimalPipe, DatePipe, SlicePipe } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Layout
import { NavbarComponent } from './layout/navbar/navbar.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';

// Reusable Components
import { SecurityStatusComponent } from './components/security-status/security-status.component';
import { TerminalComponent } from './components/terminal/terminal.component';
import { OfflineAlertComponent } from './components/offline-alert/offline-alert.component';
import { ThreatAlertComponent } from './components/threat-alert/threat-alert.component';
import { ToastComponent } from './components/toast/toast.component';
import { UploadCircleComponent } from './components/upload-circle/upload-circle.component';
import { UploadModalComponent } from './components/upload-modal/upload-modal.component';
import { PrivateKeyModalComponent } from './components/private-key-modal/private-key-modal.component';

// Pages
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UploadPageComponent } from './pages/upload-page/upload-page.component';
import { ThreatMonitorComponent } from './pages/threat-monitor/threat-monitor.component';
import { SentFilesComponent } from './pages/sent-files/sent-files.component';
import { ReceivedFilesComponent } from './pages/received-files/received-files.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ReceiveComponent } from './pages/receive/receive.component';

import { AuthInterceptor } from './auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SidebarComponent,
    SecurityStatusComponent,
    TerminalComponent,
    OfflineAlertComponent,
    ThreatAlertComponent,
    ToastComponent,
    UploadCircleComponent,
    UploadModalComponent,
    PrivateKeyModalComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    UploadPageComponent,
    ThreatMonitorComponent,
    SentFilesComponent,
    ReceivedFilesComponent,
    ProfileComponent,
    ReceiveComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    DecimalPipe,
    DatePipe,
    SlicePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
