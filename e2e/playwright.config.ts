import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 30000,
  expect: { timeout: 10000 },

  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  webServer: [
    {
      command: 'npm run dev',
      port: 3000,
      cwd: '../backend',
      reuseExistingServer: !process.env.CI,
      timeout: 15000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: { PORT: '3000' },
    },
    {
      command: 'npx vite --host 127.0.0.1',
      port: 5173,
      cwd: '../frontend',
      reuseExistingServer: !process.env.CI,
      timeout: 15000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: { VITE_API_BASE_URL: 'http://127.0.0.1:3000' },
    },
  ],
});
