import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobile?: string;
  flatNumber?: string;
  roles: string[];
}

interface AuthResponse {
  token: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobile?: string;
  flatNumber?: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'gruhasti_token';
  private readonly USER_KEY = 'gruhasti_user';

  private _user = signal<AuthUser | null>(this.loadUser());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.roles?.includes('ADMIN') ?? false);

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiBaseUrl}/auth/login`, { email, password }).pipe(
      tap(res => this.store(res))
    );
  }

  register(payload: {
    firstName: string; lastName: string; mobile: string; flatNumber: string;
    email: string; password: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiBaseUrl}/auth/register`, payload).pipe(
      tap(res => this.store(res))
    );
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${environment.apiBaseUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${environment.apiBaseUrl}/auth/reset-password`, { token, newPassword });
  }

  updateProfile(payload: {
    firstName: string; lastName: string; mobile: string; flatNumber: string;
  }): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${environment.apiBaseUrl}/profile`, payload).pipe(
      tap(res => this.store(res))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private store(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    const user: AuthUser = {
      id: res.id, email: res.email,
      firstName: res.firstName, lastName: res.lastName,
      mobile: res.mobile, flatNumber: res.flatNumber,
      roles: res.roles
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
