import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';

const PATHS = [
  '/',      // Homepage
  '/plans', // Public Plans
  '/dashboard', // Private Dashboard
  '/dashboard/resources', // Internal List
];

// Load tokens manually for ESM compatibility
const config = JSON.parse(fs.readFileSync(path.resolve('tests/color-audit/tokens.json'), 'utf-8'));

async function expectStyleToMatchToken(page: Page, selector: string, property: string, tokenVar: string) {
  const element = page.locator(selector).first();
  if (await element.count() === 0) return; 
  
  await element.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

  let lastResult: any = { match: false };
  for (let i = 0; i < 4; i++) {
    const result = await page.evaluate(({ sel, prop, token }) => {
      const el = document.querySelector(sel);
      if (!el) return { match: true };

      // UNIVERSAL COLOR PARSER: Supports rgb, rgba, lab, oklab, oklch
      const parseColor = (colorStr: string) => {
        const matches = colorStr.match(/[-+]?[\d.]+/g);
        if (!matches || matches.length < 3) return null;
        return { r: parseFloat(matches[0]), g: parseFloat(matches[1]), b: parseFloat(matches[2]) };
      };

      el.getBoundingClientRect(); // Force reflow

      const temp = document.createElement('div');
      temp.style.visibility = 'hidden';
      document.body.appendChild(temp);
      temp.style.setProperty(prop, token);
      let expectedStr = getComputedStyle(temp).getPropertyValue(prop);
      
      if (!expectedStr || expectedStr === 'rgba(0, 0, 0, 0)') {
        const varName = token.replace(/var\(|\)/g, '').trim();
        expectedStr = getComputedStyle(document.body).getPropertyValue(varName);
      }
      
      const actualStr = getComputedStyle(el).getPropertyValue(prop);
      document.body.removeChild(temp);

      const expected = parseColor(expectedStr);
      const actual = parseColor(actualStr);
      
      if (expected && actual) {
        // EUCLIDEAN DISTANCE comparison
        const distance = Math.sqrt(
          Math.pow(expected.r - actual.r, 2) +
          Math.pow(expected.g - actual.g, 2) +
          Math.pow(expected.b - actual.b, 2)
        );
        return { match: distance <= 30, actual: actualStr, expected: expectedStr };
      }

      const normalize = (s: string) => s.replace(/['"]/g, '').toLowerCase().trim();
      return { 
        match: normalize(actualStr) === normalize(expectedStr) || actualStr.includes(expectedStr), 
        actual: actualStr, 
        expected: expectedStr 
      };
    }, { sel: selector, prop: property, token: tokenVar });

    if (result.match) return;
    lastResult = result;
    await page.waitForTimeout(400); 
  }

  throw new Error(`[Consistency Error] ${selector} -> ${property}: expected ${tokenVar} (${lastResult.expected}), but found ${lastResult.actual}`);
}

for (const pathStr of PATHS) {
  test.describe(`Audit Path: ${pathStr}`, () => {
    // Run all audits for both Light and Dark themes
    for (const theme of ['light', 'dark']) {
      test.describe(`Theme: ${theme.toUpperCase()}`, () => {
        test.beforeEach(async ({ page }) => {
          test.setTimeout(90000); 
          await page.setExtraHTTPHeaders({ 'x-audit-bypass': 'true' });
          await page.goto(pathStr);
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(1000);
          
          await page.evaluate((currentTheme) => {
            document.documentElement.setAttribute('data-audit-mode', 'true');
            if (currentTheme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }, theme);
        });

        for (const [roleName, roleDef] of Object.entries(config.roles)) {
          test(`Design System Audit: ${roleName}`, async ({ page }) => {
            const def = roleDef as any;
            const count = await page.locator(def.selector).count();
            if (count === 0) return;

            for (const [prop, token] of Object.entries(def.expected)) {
              await expectStyleToMatchToken(page, def.selector, prop, token as string);
            }
          });

          if (roleDef.states?.hover) {
            test(`State Audit: ${roleName} (Hover)`, async ({ page }) => {
              const def = roleDef as any;
              const button = page.locator(def.selector).filter({ visible: true }).first();
              if (await button.count() === 0) return;
              
              await button.scrollIntoViewIfNeeded();
              await button.hover({ force: true });
              await page.waitForTimeout(1000); 

              for (const [prop, token] of Object.entries(def.states.hover)) {
                await expectStyleToMatchToken(page, def.selector, prop, token as string);
              }
            });
          }
        }

        test('Accessibility: Global Color Contrast Scan', async ({ page }) => {
          const accessibilityScanResults = await new AxeBuilder({ page })
            .withRules(['color-contrast'])
            .analyze();
          expect(accessibilityScanResults.violations).toEqual([]);
        });
      });
    }
  });
}
