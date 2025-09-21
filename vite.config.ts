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
        statements: 77.16,
        functions: 89.09,
        branches: 87.08,
        lines: 77.16,
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