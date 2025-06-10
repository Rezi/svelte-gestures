/// <reference types="@vitest/browser/providers/playwright" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    coverage: {
      include: [
        'src/gestures/**/*.{js,ts}',
        'src/plugins/*.{js,ts}',
        'src/shared.ts',
      ],
      provider: 'v8',
      reportsDirectory: './coverage',
      thresholds: {
        autoUpdate: true,
        statements: 76.38,
        functions: 89.09,
        branches: 91.45,
        lines: 76.38,
      },
    },
    browser: {
      screenshotFailures: false,
      provider: 'playwright',
      enabled: true,
      instances: [
        {
          headless: true,
          browser: 'chromium',
        },
      ],
    },
  },
});