import { Routes } from '@angular/router';
import { AuthPage } from './auth/auth-page/auth-page';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './auth/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: AuthPage },
  { path: 'register', component: AuthPage },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];
