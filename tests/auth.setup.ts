import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authFile = 'tests/color-audit/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Ensure the directory exists
  const dir = path.dirname(authFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Go to root page first to have the right context
  await page.goto('/');

  // Attempt to sign in via API directly (bypassing OTP UI)
  // Since emailAndPassword is enabled in the backend, this should work
  const loginSuccess = await page.evaluate(async () => {
    try {
      // Access the authClient which is usually available or we can import it
      // For Playwright, it's easier to use fetch to the auth endpoint directly
      const response = await fetch('/api/v1/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'tjgontijo@gmail.com',
          password: 'Thi##123'
        })
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  });

  if (!loginSuccess) {
    throw new Error('Falha no login via API. Verifique se o usuário tjgontijo@gmail.com existe com a senha correta.');
  }

  // Verify we are logged in by going to dashboard
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/.*dashboard/);
  
  // Save storage state
  await page.context().storageState({ path: authFile });
});
