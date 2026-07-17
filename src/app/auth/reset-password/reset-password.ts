import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword {
  token: string | null = null;
  loading = signal(false);
  done = signal(false);
  errorMessage = signal('');

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    route: ActivatedRoute,
    private auth: AuthService
  ) {
    this.token = route.snapshot.queryParamMap.get('token');

    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    });
  }

  get passwordsMismatch(): boolean {
    const { newPassword, confirmPassword } = this.form.value;
    return !!confirmPassword && newPassword !== confirmPassword;
  }

  onSubmit(): void {
    if (this.form.invalid || this.passwordsMismatch || !this.token) return;
    this.loading.set(true);
    this.errorMessage.set('');
    this.auth.resetPassword(this.token, this.form.value.newPassword).subscribe({
      next: () => {
        this.done.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.error ?? 'This reset link is invalid or has expired.');
        this.loading.set(false);
      },
    });
  }

  goLogin(): void {
    this.router.navigate(['/login']);
  }
}
