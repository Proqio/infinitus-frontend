---
name: playwright
description: Playwright E2E testing patterns. Trigger when writing Playwright tests (Page Object Model, selectors, assertions, MCP workflow, fixtures, network mocking).
license: Apache-2.0
metadata:
    author: Infinitus
    version: '1.0'
    scope: [frontend, test, ui]
    auto_invoke: 'Writing Playwright E2E tests'
    allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## MCP Workflow (REQUIRED when playwright-mcp is available)

Use the MCP server to interact with the browser before writing tests. This lets you explore, find real selectors, and validate behavior.

```
1. mcp__playwright__browser_navigate  → go to the page
2. mcp__playwright__browser_snapshot  → get accessibility tree
3. mcp__playwright__browser_click / browser_fill  → interact
4. mcp__playwright__browser_take_screenshot  → verify visually
5. Write the test using discovered selectors
```

## Page Object Model (REQUIRED)

Every page or reusable section must have a Page Object.

```typescript
// ✅ tests/pages/login.page.ts
import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly errorMessage: Locator;

    constructor(private readonly page: Page) {
        this.emailInput = page.getByLabel('Email');
        this.passwordInput = page.getByLabel('Password');
        this.submitButton = page.getByRole('button', { name: 'Sign in' });
        this.errorMessage = page.getByRole('alert');
    }

    async goto() {
        await this.page.goto('/login');
    }

    async login(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
    }
}
```

```typescript
// ✅ Usage in test
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test('user can log in', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('user@example.com', 'password123');
    await expect(page).toHaveURL('/dashboard');
});
```

## Selector Priority (REQUIRED)

Use selectors in this order — prefer user-facing attributes.

```typescript
// 1. ✅ BEST: Role + name (accessible, closest to user intent)
page.getByRole('button', { name: 'Submit' });
page.getByRole('link', { name: 'Dashboard' });
page.getByRole('textbox', { name: 'Search' });

// 2. ✅ Label (forms)
page.getByLabel('Email address');

// 3. ✅ Placeholder
page.getByPlaceholder('Enter your email');

// 4. ✅ Text content
page.getByText('Welcome back');

// 5. ✅ Test id (last resort for dynamic/complex UI)
page.getByTestId('user-menu');

// ❌ NEVER: CSS classes (break on refactor)
page.locator('.btn-primary');
page.locator('div > span.label');

// ❌ NEVER: XPath
page.locator("//button[@class='submit']");

// ❌ NEVER: nth-child or index-based
page.locator('li').nth(2);
```

## Assertions

Always use `expect` with web-first assertions (auto-retry built in).

```typescript
// ✅ Visibility
await expect(page.getByRole('alert')).toBeVisible();
await expect(page.getByText('Loading...')).toBeHidden();

// ✅ Text content
await expect(page.getByRole('heading')).toHaveText('Dashboard');
await expect(page.getByRole('status')).toContainText('Saved');

// ✅ URL
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveURL(/\/users\/\d+/);

// ✅ Input value
await expect(page.getByLabel('Name')).toHaveValue('Alice');

// ✅ Count
await expect(page.getByRole('listitem')).toHaveCount(5);

// ✅ Attribute
await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled();
await expect(page.getByRole('checkbox')).toBeChecked();

// ❌ NEVER: Manual waits
await page.waitForTimeout(1000); // flaky, avoid
```

## Fixtures

Use fixtures for shared setup instead of `beforeEach`.

```typescript
// ✅ tests/fixtures.ts
import { test as base } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { DashboardPage } from './pages/dashboard.page';

type Fixtures = {
    loginPage: LoginPage;
    dashboardPage: DashboardPage;
    authenticatedPage: Page;
};

export const test = base.extend<Fixtures>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },

    dashboardPage: async ({ page }, use) => {
        await use(new DashboardPage(page));
    },

    authenticatedPage: async ({ page }, use) => {
        // Reuse auth state instead of logging in every test
        await page.goto('/dashboard');
        await use(page);
    },
});

export { expect } from '@playwright/test';
```

```typescript
// ✅ Authenticated state (storageState)
// playwright.config.ts
export default defineConfig({
    projects: [
        {
            name: 'setup',
            testMatch: '**/auth.setup.ts',
        },
        {
            name: 'chromium',
            dependencies: ['setup'],
            use: { storageState: '.auth/user.json' },
        },
    ],
});

// auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(process.env.TEST_EMAIL!);
    await page.getByLabel('Password').fill(process.env.TEST_PASSWORD!);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('/dashboard');
    await page.context().storageState({ path: '.auth/user.json' });
});
```

## Network Mocking

```typescript
// ✅ Mock API responses
test('shows error on failed request', async ({ page }) => {
    await page.route('**/api/users', (route) =>
        route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        }),
    );

    await page.goto('/users');
    await expect(page.getByRole('alert')).toContainText('Something went wrong');
});

// ✅ Intercept and modify
await page.route('**/api/data', async (route) => {
    const response = await route.fetch();
    const json = await response.json();
    json.items.push({ id: 'test', name: 'Extra Item' });
    await route.fulfill({ response, json });
});

// ✅ Wait for a specific request
const responsePromise = page.waitForResponse('**/api/submit');
await page.getByRole('button', { name: 'Submit' }).click();
const response = await responsePromise;
expect(response.status()).toBe(200);
```

## Test Structure

### Before Writing a New Test (REQUIRED)

Search existing tests to avoid duplication:

```bash
# Search by feature/page name
grep -r "describe.*Login" tests/
grep -r "\"user can log in\"" tests/

# Search by scenario keyword
grep -r "checkout" tests/e2e/
```

If the behavior is already tested → extend the existing `test.describe` block, do not create a new file or duplicate the test.

```typescript
// ✅ One behavior per test, descriptive names
test.describe('Login page', () => {
    test('shows validation error for empty email', async ({ page }) => {});
    test('shows validation error for invalid password', async ({ page }) => {});
    test('redirects to dashboard on success', async ({ page }) => {});
    test('shows error message on wrong credentials', async ({ page }) => {});
});

// ✅ Use test.step for complex flows (better reports)
test('complete checkout flow', async ({ page }) => {
    await test.step('add item to cart', async () => {
        await page.getByRole('button', { name: 'Add to cart' }).click();
    });

    await test.step('proceed to checkout', async () => {
        await page.getByRole('link', { name: 'Checkout' }).click();
        await expect(page).toHaveURL('/checkout');
    });

    await test.step('confirm order', async () => {
        await page.getByRole('button', { name: 'Place order' }).click();
        await expect(page.getByRole('heading')).toHaveText('Order confirmed');
    });
});
```

## File Structure

```
tests/
├── auth.setup.ts          # Auth state setup
├── fixtures.ts            # Shared fixtures
├── pages/                 # Page Objects
│   ├── login.page.ts
│   ├── dashboard.page.ts
│   └── users.page.ts
├── e2e/                   # Tests grouped by feature
│   ├── auth.spec.ts
│   ├── dashboard.spec.ts
│   └── users.spec.ts
└── helpers/               # Test utilities
    └── api.ts
```

## Config Essentials

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: [['html'], ['list']],
    use: {
        baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
```
