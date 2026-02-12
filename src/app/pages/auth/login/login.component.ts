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
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.toastService.show('Login successful! Welcome back.', 'success');
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Login failed', error);
          this.toastService.show(error.error?.message || 'Login failed. Please check your credentials.', 'error');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.toastService.show('Please fill in all required fields', 'info');
    }
  }
}
