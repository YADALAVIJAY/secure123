import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ReceiveComponent } from './pages/receive/receive.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UploadPageComponent } from './pages/upload-page/upload-page.component';
import { ThreatMonitorComponent } from './pages/threat-monitor/threat-monitor.component';
import { SentFilesComponent } from './pages/sent-files/sent-files.component';
import { ReceivedFilesComponent } from './pages/received-files/received-files.component';
import { ProfileComponent } from './pages/profile/profile.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'upload', component: UploadPageComponent },
  { path: 'threat-monitor', component: ThreatMonitorComponent },
  { path: 'sent', component: SentFilesComponent },
  { path: 'inbox', component: ReceivedFilesComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'receive', component: ReceiveComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
