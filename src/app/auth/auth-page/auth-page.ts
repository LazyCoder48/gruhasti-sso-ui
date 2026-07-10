import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth';

type View = 'login' | 'register' | 'forgot';

@Component({
  selector: 'app-auth-page',
  imports: [ReactiveFormsModule],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.scss',
})
export class AuthPage {
  view: View = 'login';
  showPassword = false;
  loading = false;
  errorMessage = '';
  forgotSubmitted = false;
  otpHint = false;

  loginForm: FormGroup;
  registerForm: FormGroup;
  forgotForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    route: ActivatedRoute,
    private auth: AuthService
  ) {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
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
      identifier: ['', Validators.required],
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
    this.errorMessage = '';
  }

  goRegister(): void {
    this.view = 'register';
    this.errorMessage = '';
  }

  goForgot(): void {
    this.view = 'forgot';
    this.errorMessage = '';
    this.forgotSubmitted = false;
  }

  showOtpHint(): void {
    this.otpHint = true;
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    const { email, password } = this.loginForm.value;
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.errorMessage = err.error?.error ?? 'Invalid email or password.';
        this.loading = false;
      },
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    const { fullName, flatNumber, mobile, email, password } = this.registerForm.value;
    const [firstName, ...rest] = fullName.trim().split(/\s+/);
    const lastName = rest.join(' ') || firstName;
    this.auth.register({ firstName, lastName, flatNumber, mobile, email, password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.errorMessage = err.error?.error ?? 'Registration failed. Please try again.';
        this.loading = false;
      },
    });
  }

  onForgotSubmit(): void {
    if (this.forgotForm.invalid) return;
    this.forgotSubmitted = true;
  }
}
