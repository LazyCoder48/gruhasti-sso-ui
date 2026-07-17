import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './auth/jwt-interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';

// Gruhasti · "Mint & chalkboard" preset — light band 05 / dark band 13.
// Dark mode activates via the '.p2p-dark' class on <html> (toggled by ThemeService).
const MintChalkboardPreset = definePreset(Aura, {
  primitive: {
    borderRadius: { none: '0', xs: '6px', sm: '10px', md: '12px', lg: '16px', xl: '24px' },
    brand: {
      50: '#F0F8F5',
      100: '#E2F1EC',
      200: '#C4E4D8',
      300: '#A1D3C0',
      400: '#6DBB9E',
      500: '#2E9E74',
      600: '#268760',
      700: '#1F6F4F',
      800: '#18563D',
      900: '#12412E',
      950: '#0C2B1F',
    },
    accent: {
      50: '#FFF9F5',
      100: '#FFF3EC',
      200: '#FFE7D9',
      300: '#FFD9C1',
      400: '#FFC49F',
      500: '#FFAB76',
      600: '#E09668',
      700: '#B87B55',
      800: '#8F6043',
      900: '#6C4832',
      950: '#483021',
    },
  },
  semantic: {
    primary: {
      50: '{brand.50}', 100: '{brand.100}', 200: '{brand.200}', 300: '{brand.300}',
      400: '{brand.400}', 500: '{brand.500}', 600: '{brand.600}', 700: '{brand.700}',
      800: '{brand.800}', 900: '{brand.900}', 950: '{brand.950}',
    },
    formField: {
      borderRadius: '{border.radius.lg}',
      focusRing: {
        width: '0', style: 'none', color: 'transparent', offset: '0',
        shadow: '0 0 0 4px color-mix(in srgb, {primary.color}, transparent 80%)',
      },
    },
    colorScheme: {
      light: {
        surface: {
          0: '#FFFFFF', 50: '#FBFEFC', 100: '#EAF6EF', 200: '#E2F1E8', 300: '#CDE5D6',
          400: '#9EB8A9', 500: '#6F8A7C', 600: '#5D786C', 700: '#4B665B', 800: '#39544B',
          900: '#27423A', 950: '#1B2E29',
        },
        primary: { color: '{brand.500}', contrastColor: '#FFFFFF', hoverColor: '{brand.600}', activeColor: '{brand.700}' },
        highlight: { background: '{brand.100}', focusBackground: '{brand.200}', color: '{brand.700}', focusColor: '{brand.800}' },
      },
      dark: {
        surface: {
          0: '#FFFFFF', 50: '#ECF1EF', 100: '#DDE7E2', 200: '#CBD9D2', 300: '#B3C8BD',
          400: '#96B3A4', 500: '#5D796B', 600: '#2F4A3C', 700: '#22392C', 800: '#1E3428',
          900: '#16281F', 950: '#0F1F18',
        },
        primary: { color: '#4FC094', contrastColor: '#16281F', hoverColor: '#68C9A3', activeColor: '{brand.500}' },
        highlight: {
          background: 'color-mix(in srgb, #4FC094, transparent 84%)',
          focusBackground: 'color-mix(in srgb, #4FC094, transparent 76%)',
          color: 'rgba(255,255,255,.87)', focusColor: 'rgba(255,255,255,.87)',
        },
      },
    },
  },
  components: {
    button: { root: { borderRadius: '999px' } },
    chip: { root: { borderRadius: '999px' } },
    tag: { root: { borderRadius: '999px' } },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({ theme: { preset: MintChalkboardPreset, options: { darkModeSelector: '.p2p-dark' } } })
  ]
};
