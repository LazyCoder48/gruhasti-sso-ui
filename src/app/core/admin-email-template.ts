import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type EmailTemplateType =
  | 'REGISTRATION_WELCOME'
  | 'NEW_DEVICE_LOGIN'
  | 'PASSWORD_RESET'
  | 'PROFILE_UPDATED';

export interface EmailTemplate {
  id: string;
  type: EmailTemplateType;
  subject: string;
  heading: string;
  bodyText: string;
  buttonLabel: string;
  buttonUrl: string;
  enabled: boolean;
  headerImagePresent: boolean;
}

export interface UpdateEmailTemplateRequest {
  subject: string;
  heading: string;
  bodyText: string;
  buttonLabel: string;
  buttonUrl: string;
}

@Injectable({ providedIn: 'root' })
export class AdminEmailTemplateService {
  private readonly base = `${environment.apiBaseUrl}/admin/email-templates`;

  constructor(private http: HttpClient) {}

  list(): Observable<EmailTemplate[]> {
    return this.http.get<EmailTemplate[]>(this.base);
  }

  update(type: EmailTemplateType, req: UpdateEmailTemplateRequest): Observable<EmailTemplate> {
    return this.http.put<EmailTemplate>(`${this.base}/${type}`, req);
  }

  uploadHeaderImage(type: EmailTemplateType, file: File): Observable<EmailTemplate> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<EmailTemplate>(`${this.base}/${type}/header-image`, formData);
  }

  removeHeaderImage(type: EmailTemplateType): Observable<EmailTemplate> {
    return this.http.delete<EmailTemplate>(`${this.base}/${type}/header-image`);
  }

  /** Public, unauthenticated URL a recipient's mail client (or this admin UI) can load directly. */
  headerImageUrl(type: EmailTemplateType): string {
    return `${environment.apiBaseUrl}/email-templates/${type}/header-image`;
  }
}
