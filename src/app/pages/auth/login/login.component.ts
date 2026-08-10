import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage = '';
  isAuthenticating = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.loginForm.valueChanges.subscribe(() => {
      this.errorMessage = '';
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isAuthenticating = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.isAuthenticating = false;
          this.toastService.show('Authentication verified. Welcome back.', 'success');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isAuthenticating = false;
          console.error('Login failed', error);
          const msg = error.error?.message || error.error || 'Authentication failed. Please check credentials.';
          this.errorMessage = msg;
          this.toastService.show(msg, 'error');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.toastService.show('Please enter both username and password.', 'info');
    }
  }
}
