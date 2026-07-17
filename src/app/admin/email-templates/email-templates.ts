import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import {
  AdminEmailTemplateService,
  EmailTemplate,
  EmailTemplateType,
} from '../../core/admin-email-template';
import { ThemeService } from '../../core/theme';

interface TemplateDraft {
  subject: string;
  heading: string;
  bodyText: string;
  buttonLabel: string;
  buttonUrl: string;
}

interface CardState {
  type: EmailTemplateType;
  title: string;
  hint: string;
  draft: TemplateDraft;
  saving: boolean;
  saved: boolean;
  headerImagePresent: boolean;
  uploadingHeaderImage: boolean;
  headerImageCacheBust: number;
}

const EMPTY_DRAFT: TemplateDraft = {
  subject: '',
  heading: '',
  bodyText: '',
  buttonLabel: '',
  buttonUrl: '',
};

const CARD_META: { type: EmailTemplateType; title: string; hint: string }[] = [
  {
    type: 'REGISTRATION_WELCOME',
    title: 'Registration welcome',
    hint: 'Sent right after a new customer creates an account.',
  },
  {
    type: 'NEW_DEVICE_LOGIN',
    title: 'New-device login alert',
    hint: "Sent when a customer signs in from a browser or device we haven't seen before.",
  },
  {
    type: 'PASSWORD_RESET',
    title: 'Password reset',
    hint: 'Sent when a customer requests a password reset. The button always uses the one-time reset link — the Button URL field below has no effect on it.',
  },
  {
    type: 'PROFILE_UPDATED',
    title: 'Profile updated',
    hint: "Sent whenever a customer's profile details change.",
  },
];

function toDraft(t: EmailTemplate): TemplateDraft {
  return {
    subject: t.subject,
    heading: t.heading,
    bodyText: t.bodyText,
    buttonLabel: t.buttonLabel,
    buttonUrl: t.buttonUrl,
  };
}

@Component({
  selector: 'app-email-templates',
  imports: [RouterLink, FormsModule, Button],
  templateUrl: './email-templates.html',
  styleUrl: './email-templates.scss',
})
export class EmailTemplates implements OnInit {
  loading = signal(true);
  errorMessage = signal('');

  templates = signal<CardState[]>(
    CARD_META.map((meta) => ({
      ...meta,
      draft: EMPTY_DRAFT,
      saving: false,
      saved: false,
      headerImagePresent: false,
      uploadingHeaderImage: false,
      headerImageCacheBust: Date.now(),
    }))
  );

  constructor(
    private adminEmailTemplateService: AdminEmailTemplateService,
    readonly theme: ThemeService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  updateField(type: EmailTemplateType, field: keyof TemplateDraft, value: string): void {
    this.updateCard(type, (card) => ({ draft: { ...card.draft, [field]: value }, saved: false }));
  }

  save(type: EmailTemplateType): void {
    const card = this.templates().find((c) => c.type === type);
    if (!card) return;

    this.updateCard(type, () => ({ saving: true, saved: false }));
    this.errorMessage.set('');

    this.adminEmailTemplateService.update(type, card.draft).subscribe({
      next: (updated) => this.updateCard(type, () => ({ draft: toDraft(updated), saving: false, saved: true })),
      error: (err) => {
        this.updateCard(type, () => ({ saving: false }));
        this.errorMessage.set(err.error?.error ?? `Could not save the ${card.title} template.`);
      },
    });
  }

  headerImageUrl(type: EmailTemplateType, cacheBust: number): string {
    return `${this.adminEmailTemplateService.headerImageUrl(type)}?t=${cacheBust}`;
  }

  onHeaderImageSelected(type: EmailTemplateType, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.updateCard(type, () => ({ uploadingHeaderImage: true }));
    this.errorMessage.set('');

    this.adminEmailTemplateService.uploadHeaderImage(type, file).subscribe({
      next: (updated) =>
        this.updateCard(type, () => ({
          headerImagePresent: updated.headerImagePresent,
          headerImageCacheBust: Date.now(),
          uploadingHeaderImage: false,
        })),
      error: (err) => {
        this.updateCard(type, () => ({ uploadingHeaderImage: false }));
        this.errorMessage.set(err.error?.error ?? 'Could not upload the header image.');
      },
    });

    (event.target as HTMLInputElement).value = '';
  }

  removeHeaderImage(type: EmailTemplateType): void {
    this.updateCard(type, () => ({ uploadingHeaderImage: true }));
    this.errorMessage.set('');

    this.adminEmailTemplateService.removeHeaderImage(type).subscribe({
      next: () => this.updateCard(type, () => ({ headerImagePresent: false, uploadingHeaderImage: false })),
      error: (err) => {
        this.updateCard(type, () => ({ uploadingHeaderImage: false }));
        this.errorMessage.set(err.error?.error ?? 'Could not remove the header image.');
      },
    });
  }

  private updateCard(type: EmailTemplateType, patch: (card: CardState) => Partial<CardState>): void {
    this.templates.update((list) =>
      list.map((card) => (card.type === type ? { ...card, ...patch(card) } : card))
    );
  }

  private load(): void {
    this.loading.set(true);
    this.adminEmailTemplateService.list().subscribe({
      next: (list) => {
        this.templates.update((cards) =>
          cards.map((card) => {
            const found = list.find((t) => t.type === card.type);
            return found ? { ...card, draft: toDraft(found), headerImagePresent: found.headerImagePresent } : card;
          })
        );
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.error ?? 'Could not load email templates.');
        this.loading.set(false);
      },
    });
  }
}
