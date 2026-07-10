import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../auth/auth';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, ButtonModule, CardModule, TagModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  constructor(readonly auth: AuthService) {}
}
