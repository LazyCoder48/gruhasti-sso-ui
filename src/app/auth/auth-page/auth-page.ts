import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth';
import { ThemeService } from '../../core/theme';

type View = 'login' | 'register' | 'forgot';

// Origins this SSO instance is allowed to hand a live JWT back to via the token-in-URL
// handoff. Without this allow-list, a crafted `?returnUrl=https://evil.com` link to this
// login page would make sso-ui redirect a real session token to an attacker-controlled site.
const ALLOWED_RETURN_ORIGINS = [
  'http://localhost:4200',
  'http://localhost:4201',
  'http://localhost:4202',
  'http://localhost:8080',
  'https://gruhasti.vip',
  'https://shuddha.gruhasti.vip',
  'https://pen2ppr.gruhasti.vip',
];

function sanitizeReturnUrl(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return ALLOWED_RETURN_ORIGINS.includes(url.origin) ? raw : null;
  } catch {
    return null;
  }
}

@Component({
  selector: 'app-auth-page',
  imports: [ReactiveFormsModule],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.scss',
})
export class AuthPage {
  view: View = 'login';
  showPassword = false;
  otpHint = false;

  // Async-mutated (inside .subscribe() callbacks) — this app is zoneless, so these must be
  // signals or the template silently never re-renders after the HTTP response arrives.
  loading = signal(false);
  errorMessage = signal('');
  forgotSubmitted = signal(false);

  loginForm: FormGroup;
  registerForm: FormGroup;
  forgotForm: FormGroup;

  private readonly returnUrl: string | null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    route: ActivatedRoute,
    private auth: AuthService,
    readonly theme: ThemeService
  ) {
    this.returnUrl = sanitizeReturnUrl(route.snapshot.queryParamMap.get('returnUrl'));
    if (this.auth.isLoggedIn()) {
      this.navigateAfterAuth();
    }
    this.view = route.snapshot.routeConfig?.path === 'register' ? 'register' : 'login';

    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      flatNumber: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{7,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get passwordType(): string {
    return this.showPassword ? 'text' : 'password';
  }

  get passwordLabel(): string {
    return this.showPassword ? 'Hide' : 'Show';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  goLogin(): void {
    this.view = 'login';
    this.errorMessage.set('');
  }

  goRegister(): void {
    this.view = 'register';
    this.errorMessage.set('');
  }

  goForgot(): void {
    this.view = 'forgot';
    this.errorMessage.set('');
    this.forgotSubmitted.set(false);
  }

  showOtpHint(): void {
    this.otpHint = true;
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');
    const { email, password } = this.loginForm.value;
    this.auth.login(email, password).subscribe({
      next: () => this.navigateAfterAuth(),
      error: (err) => {
        this.errorMessage.set(err.error?.error ?? 'Invalid email or password.');
        this.loading.set(false);
      },
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');
    const { fullName, flatNumber, mobile, email, password } = this.registerForm.value;
    const [firstName, ...rest] = fullName.trim().split(/\s+/);
    const lastName = rest.join(' ') || firstName;
    this.auth.register({ firstName, lastName, flatNumber, mobile, email, password }).subscribe({
      next: () => this.navigateAfterAuth(),
      error: (err) => {
        this.errorMessage.set(err.error?.error ?? 'Registration failed. Please try again.');
        this.loading.set(false);
      },
    });
  }

  /**
   * After a successful login/register (or if already logged in), either bounce back to the
   * app that redirected here — carrying the JWT via a query param since a different app is
   * almost always a different origin, so localStorage can't be shared directly — or, absent
   * a returnUrl, fall back to sso-ui's own dashboard.
   */
  private navigateAfterAuth(): void {
    if (this.returnUrl) {
      const token = this.auth.getToken();
      const separator = this.returnUrl.includes('?') ? '&' : '?';
      window.location.href = `${this.returnUrl}${separator}ssoToken=${encodeURIComponent(token ?? '')}`;
      return;
    }
    this.router.navigate(['/dashboard']);
  }

  onForgotSubmit(): void {
    if (this.forgotForm.invalid) return;
    this.loading.set(true);
    const { email } = this.forgotForm.value;
    this.auth.forgotPassword(email).subscribe({
      next: () => {
        this.forgotSubmitted.set(true);
        this.loading.set(false);
      },
      error: () => {
        // Backend always returns 200 regardless of whether the email exists — a real error
        // here means something else went wrong, but we still show the same neutral message
        // rather than leaking which emails are registered.
        this.forgotSubmitted.set(true);
        this.loading.set(false);
      },
    });
  }
}
