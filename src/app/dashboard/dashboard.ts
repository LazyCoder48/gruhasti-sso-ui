import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../auth/auth';
import { ThemeService } from '../core/theme';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, ButtonModule, CardModule, TagModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  editing = signal(false);
  saving = signal(false);
  errorMessage = signal('');

  readonly pen2paperUrl = environment.pen2paperUrl;
  readonly shuddhaUrl = environment.shuddhaUrl;

  form: FormGroup;

  constructor(readonly auth: AuthService, readonly theme: ThemeService, private fb: FormBuilder) {
    const user = this.auth.user();
    this.form = this.fb.group({
      firstName: [user?.firstName ?? '', Validators.required],
      lastName: [user?.lastName ?? '', Validators.required],
      mobile: [user?.mobile ?? '', Validators.required],
      flatNumber: [user?.flatNumber ?? '', Validators.required],
    });
  }

  startEditing(): void {
    const user = this.auth.user();
    this.form.reset({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      mobile: user?.mobile ?? '',
      flatNumber: user?.flatNumber ?? '',
    });
    this.errorMessage.set('');
    this.editing.set(true);
  }

  cancelEditing(): void {
    this.editing.set(false);
  }

  /**
   * Navigates to another Gruhasti app, handing off the current session via `?ssoToken=`
   * so the destination app's `consumeSsoTokenFromUrl()` (see its core/auth.ts) can hydrate
   * itself without a separate login — the same mechanism used when an unauthenticated user
   * is bounced here and back, just initiated proactively from an already-logged-in dashboard.
   */
  goToApp(url: string): void {
    const token = this.auth.getToken();
    window.location.href = token ? `${url}?ssoToken=${encodeURIComponent(token)}` : url;
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');
    this.auth.updateProfile(this.form.value).subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.error ?? 'Could not update profile.');
        this.saving.set(false);
      },
    });
  }
}
