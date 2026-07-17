import { Routes } from '@angular/router';
import { AuthPage } from './auth/auth-page/auth-page';
import { ResetPassword } from './auth/reset-password/reset-password';
import { Dashboard } from './dashboard/dashboard';
import { EmailTemplates } from './admin/email-templates/email-templates';
import { authGuard, adminGuard } from './auth/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: AuthPage },
  { path: 'register', component: AuthPage },
  { path: 'reset-password', component: ResetPassword },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'admin/email-templates', component: EmailTemplates, canActivate: [adminGuard] },
  { path: '**', redirectTo: 'login' }
];
