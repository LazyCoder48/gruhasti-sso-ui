import { Injectable, signal } from '@angular/core';

const DARK_KEY = 'p2p-dark';

/** Light/dark toggle for the Mint & Chalkboard theme ('.p2p-dark' class on <html>). */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly dark = signal(false);

  init(): void {
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const saved = localStorage.getItem(DARK_KEY);
    this.setDark(saved !== null ? saved === '1' : !!prefersDark);
  }

  setDark(value: boolean): void {
    document.documentElement.classList.toggle('p2p-dark', value);
    this.dark.set(value);
    localStorage.setItem(DARK_KEY, value ? '1' : '0');
  }

  toggle(): void {
    this.setDark(!this.dark());
  }
}
