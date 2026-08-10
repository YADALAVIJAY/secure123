import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from './services/toast.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private authService: AuthService,
        private router: Router,
        private toastService: ToastService
    ) { }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const token = this.authService.getToken();
        if (token && !request.headers.has('Authorization')) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                // Do not convert upload/verify malware security threat into generic session expiration
                const isFileSecurityRequest = request.url.includes('/files/upload') || request.url.includes('/files/verify');
                if ((error.status === 401 || (error.status === 403 && !isFileSecurityRequest))) {
                    // Check if we are already on login page to avoid loops
                    if (!this.router.url.includes('/login')) {
                        this.toastService.show('Session expired. Please login again.', 'error');
                        this.authService.logout();
                        this.router.navigate(['/login']);
                    }
                }
                return throwError(() => error);
            })
        );
    }
}
