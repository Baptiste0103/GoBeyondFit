import { test, expect } from '@playwright/test';

/**
 * E2E Tests for GoBeyondFit Platform
 */

const BASE_URL = 'http://localhost:3000';

// Test credentials
const COACH_EMAIL = 'coach@example.com';
const COACH_PASSWORD = 'password123';
const STUDENT_EMAIL = 'student@example.com';
const STUDENT_PASSWORD = 'password123';

test.describe('GoBeyondFit E2E Tests', () => {
  test('Scenario 1: Coach creates a fitness program', async ({ page }) => {
    // Login as coach
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="email"]', COACH_EMAIL);
    await page.fill('input[name="password"]', COACH_PASSWORD);
    await page.click('button:has-text("Se connecter")');
    await page.waitForNavigation();

    // Navigate to create program
    await page.goto(`${BASE_URL}/programs/new`);
    expect(await page.title()).toContain('Nouveau Programme');

    // Fill program details
    await page.fill('input[name="title"]', 'Full Body Strength');
    await page.fill('textarea[name="description"]', 'Complete strength program');

    // Create program
    await page.click('button:has-text("Créer le programme")');
    await page.waitForNavigation();

    // Verify program created
    const programTitle = await page.locator('h1').first();
    await expect(programTitle).toContainText('Full Body Strength');
  });

  test('Scenario 2: Coach assigns program to student', async ({ page }) => {
    // Login as coach
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="email"]', COACH_EMAIL);
    await page.fill('input[name="password"]', COACH_PASSWORD);
    await page.click('button:has-text("Se connecter")');
    await page.waitForNavigation();

    // Navigate to groups
    await page.goto(`${BASE_URL}/dashboard/groups`);

    // Assign program to group
    await page.click('button:has-text("Assigner un programme")');
    await page.selectOption('select[name="program"]', 'Full Body Strength');
    await page.click('button:has-text("Assigner")');

    // Verify assignment
    await expect(page.locator('text=Programme assigné')).toBeVisible();
  });

  test('Scenario 3: Student views assigned sessions', async ({ page }) => {
    // Login as student
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="email"]', STUDENT_EMAIL);
    await page.fill('input[name="password"]', STUDENT_PASSWORD);
    await page.click('button:has-text("Se connecter")');
    await page.waitForNavigation();

    // Navigate to workouts
    await page.goto(`${BASE_URL}/workouts`);

    // Verify sessions are displayed
    const sessionCards = await page.locator('[class*="session-card"]');
    expect(await sessionCards.count()).toBeGreaterThan(0);

    // Verify session details
    const firstSession = sessionCards.first();
    await expect(firstSession.locator('text=/Exercices/')).toBeVisible();
  });

  test('Scenario 4: Student completes a workout session', async ({ page }) => {
    // Login as student
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="email"]', STUDENT_EMAIL);
    await page.fill('input[name="password"]', STUDENT_PASSWORD);
    await page.click('button:has-text("Se connecter")');
    await page.waitForNavigation();

    // Navigate to workouts
    await page.goto(`${BASE_URL}/workouts`);

    // Start first session
    await page.click('button:has-text("Commencer")');
    await page.waitForNavigation();

    // Verify workout page loaded
    await expect(page.locator('text=/Série/')).toBeVisible();

    // Fill first set
    await page.fill('input[placeholder="Reps"]', '8');
    await page.fill('input[placeholder="Weight"]', '60');
    await page.fill('input[placeholder="RPE"]', '7');

    // Mark set as complete
    await page.check('input[type="checkbox"][name^="set-complete"]');

    // Move to next set
    if (await page.locator('button:has-text("Suivant")').isVisible()) {
      await page.click('button:has-text("Suivant")');
    }

    // Complete session
    await page.click('button:has-text("Terminer la séance")');

    // Verify completion
    await expect(page.locator('text=Séance complétée')).toBeVisible();
  });

  test('Scenario 5: Verify student badges and stats', async ({ page }) => {
    // Login as student
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="email"]', STUDENT_EMAIL);
    await page.fill('input[name="password"]', STUDENT_PASSWORD);
    await page.click('button:has-text("Se connecter")');
    await page.waitForNavigation();

    // Navigate to badges
    await page.goto(`${BASE_URL}/dashboard/badges`);

    // Verify badge exists
    await expect(page.locator('text=Premier Pas')).toBeVisible();

    // Navigate to stats
    await page.goto(`${BASE_URL}/dashboard/stats`);

    // Verify stats displayed
    await expect(page.locator('text=Statistiques')).toBeVisible();
    await expect(page.locator('text=/Séances Complétées/')).toBeVisible();
    await expect(page.locator('text=/Poids Max/')).toBeVisible();
  });

  test('Scenario 6: Complete E2E workflow', async ({ page }) => {
    // Combined test: program creation → assignment → student tracking → badge earning

    // PART 1: Coach creates and publishes program
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="email"]', COACH_EMAIL);
    await page.fill('input[name="password"]', COACH_PASSWORD);
    await page.click('button:has-text("Se connecter")');
    await page.waitForNavigation();

    await page.goto(`${BASE_URL}/programs/new`);
    await page.fill('input[name="title"]', 'Test Program');
    await page.fill('textarea[name="description"]', 'Test program for E2E');
    await page.click('button:has-text("Créer le programme")');
    await page.waitForNavigation();

    // PART 2: Coach assigns to group
    await page.goto(`${BASE_URL}/dashboard/groups`);
    await page.click('button:has-text("Assigner un programme")');
    await page.selectOption('select[name="program"]', 'Test Program');
    await page.click('button:has-text("Assigner")');
    await expect(page.locator('text=Programme assigné')).toBeVisible();

    // PART 3: Logout and login as student
    await page.goto(`${BASE_URL}/auth/logout`);
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="email"]', STUDENT_EMAIL);
    await page.fill('input[name="password"]', STUDENT_PASSWORD);
    await page.click('button:has-text("Se connecter")');
    await page.waitForNavigation();

    // PART 4: Student views and starts workout
    await page.goto(`${BASE_URL}/workouts`);
    await expect(page.locator('[class*="session-card"]')).toBeTruthy();
    await page.click('button:has-text("Commencer")');
    await page.waitForNavigation();

    // PART 5: Complete workout
    await page.fill('input[placeholder="Reps"]', '8');
    await page.fill('input[placeholder="Weight"]', '60');
    await page.check('input[type="checkbox"][name^="set-complete"]');
    await page.click('button:has-text("Terminer la séance")');
    await expect(page.locator('text=Séance complétée')).toBeVisible();

    // PART 6: Verify badges earned
    await page.goto(`${BASE_URL}/dashboard/badges`);
    await expect(page.locator('text=Premier Pas')).toBeVisible();

    // PART 7: Verify stats
    await page.goto(`${BASE_URL}/dashboard/stats`);
    await expect(page.locator('text=Statistiques')).toBeVisible();
  });
});

test.describe('Performance Tests', () => {
  test('Session list loads within 2 seconds', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="email"]', STUDENT_EMAIL);
    await page.fill('input[name="password"]', STUDENT_PASSWORD);
    await page.click('button:has-text("Se connecter")');
    await page.waitForNavigation();

    const startTime = Date.now();
    await page.goto(`${BASE_URL}/workouts`);
    await page.waitForSelector('[class*="session-card"]');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(2000);
  });

  test('Workout page transitions are smooth', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="email"]', STUDENT_EMAIL);
    await page.fill('input[name="password"]', STUDENT_PASSWORD);
    await page.click('button:has-text("Se connecter")');
    await page.waitForNavigation();

    await page.goto(`${BASE_URL}/workouts`);
    await page.click('button:has-text("Commencer")');
    await page.waitForNavigation();

    // Navigate through exercises
    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      await page.click('button:has-text("Suivant")');
      await page.waitForTimeout(100);
      const transitionTime = Date.now() - startTime;

      expect(transitionTime).toBeLessThan(500);
    }
  });
});
