/**
 * E2E Test Scenarios for GoBeyondFit Platform
 * These scenarios test the complete workflow from coach program creation to student workout tracking
 */

export const E2E_SCENARIOS = {
  /**
   * Scenario 1: Coach creates a complete fitness program
   * - Coach logs in
   * - Creates new program
   * - Adds blocks and weeks
   * - Adds exercises with configuration
   * - Publishes program
   */
  coachCreateProgram: {
    name: 'Coach Create Program',
    steps: [
      {
        action: 'login',
        data: {
          email: 'coach@example.com',
          password: 'password123',
        },
      },
      {
        action: 'navigate',
        path: '/programs/new',
      },
      {
        action: 'fillForm',
        fields: {
          title: 'Full Body Strength Program',
          description: 'Complete 4-week strength building program',
        },
      },
      {
        action: 'click',
        target: 'button:contains("Créer le programme")',
      },
      {
        action: 'addBlock',
        data: {
          title: 'Week 1: Foundation',
          sessions: 3,
        },
      },
      {
        action: 'addExercise',
        data: {
          name: 'Squat',
          sets: 4,
          reps: 8,
          weight: 60,
          restPeriod: 120,
        },
      },
      {
        action: 'publish',
      },
      {
        action: 'verify',
        condition: 'programPublished',
      },
    ],
  },

  /**
   * Scenario 2: Coach assigns program to student group
   * - Coach navigates to groups
   * - Selects a student group
   * - Assigns the published program
   * - Verifies assignment
   */
  coachAssignProgram: {
    name: 'Coach Assign Program to Group',
    dependencies: ['coachCreateProgram'],
    steps: [
      {
        action: 'navigate',
        path: '/dashboard/groups',
      },
      {
        action: 'click',
        target: 'button:contains("My Group")',
      },
      {
        action: 'click',
        target: 'button:contains("Assign Program")',
      },
      {
        action: 'select',
        target: 'select[name="program"]',
        value: 'Full Body Strength Program',
      },
      {
        action: 'click',
        target: 'button:contains("Assigner")',
      },
      {
        action: 'verify',
        condition: 'programAssigned',
        expectedValue: 'Full Body Strength Program',
      },
    ],
  },

  /**
   * Scenario 3: Student views assigned programs
   * - Student logs in
   * - Navigates to programs
   * - Sees assigned programs
   * - Verifies program details are visible
   */
  studentViewPrograms: {
    name: 'Student View Assigned Programs',
    steps: [
      {
        action: 'login',
        data: {
          email: 'student@example.com',
          password: 'password123',
        },
      },
      {
        action: 'navigate',
        path: '/dashboard/programs',
      },
      {
        action: 'verify',
        condition: 'programVisible',
        expectedValue: 'Full Body Strength Program',
      },
      {
        action: 'click',
        target: 'div:contains("Full Body Strength Program")',
      },
      {
        action: 'verify',
        condition: 'programDetailsVisible',
        expectedValues: ['Week 1: Foundation', 'Squat'],
      },
    ],
  },

  /**
   * Scenario 4: Student starts and tracks a workout session
   * - Student logs in
   * - Views assigned sessions
   * - Starts a session
   * - Tracks exercises with progress
   * - Saves progress for each exercise
   * - Completes session
   */
  studentTrackWorkout: {
    name: 'Student Track Workout Session',
    steps: [
      {
        action: 'login',
        data: {
          email: 'student@example.com',
          password: 'password123',
        },
      },
      {
        action: 'navigate',
        path: '/workouts',
      },
      {
        action: 'verify',
        condition: 'sessionsDisplayed',
      },
      {
        action: 'click',
        target: 'button:contains("Commencer")',
      },
      {
        action: 'verify',
        condition: 'workoutPageLoaded',
        expectedValues: ['Squat', 'Series 1 of 4'],
      },
      {
        action: 'fillForm',
        fields: {
          'reps-input': '8',
          'weight-input': '60',
          'rpe-input': '7',
        },
      },
      {
        action: 'click',
        target: 'input[type="checkbox"][name="set-complete"]',
      },
      {
        action: 'click',
        target: 'button:contains("Suivant")',
      },
      {
        action: 'repeatForAllSets',
        data: {
          sets: 4,
          reps: 8,
          weight: 60,
        },
      },
      {
        action: 'click',
        target: 'button:contains("Terminer la séance")',
      },
      {
        action: 'verify',
        condition: 'sessionCompleted',
      },
    ],
  },

  /**
   * Scenario 5: Verify badges are awarded for session completion
   * - Student completes a session
   * - Navigate to badges page
   * - Verify badge is awarded
   * - Check stats are updated
   */
  studentEarnsBadges: {
    name: 'Student Earns Badges',
    dependencies: ['studentTrackWorkout'],
    steps: [
      {
        action: 'navigate',
        path: '/dashboard/badges',
      },
      {
        action: 'verify',
        condition: 'badgeVisible',
        expectedValue: 'Premier Pas',
      },
      {
        action: 'navigate',
        path: '/dashboard/stats',
      },
      {
        action: 'verify',
        condition: 'statsUpdated',
        expectedValues: {
          completedSessions: 1,
          completionRate: 100,
        },
      },
    ],
  },

  /**
   * Scenario 6: Complete E2E workflow
   * Full test from program creation to badge earning
   */
  completeWorkflow: {
    name: 'Complete E2E Workflow',
    steps: [
      // Coach creates program
      { action: 'executeScenario', scenario: 'coachCreateProgram' },
      // Coach assigns program
      { action: 'executeScenario', scenario: 'coachAssignProgram' },
      // Student views programs
      { action: 'executeScenario', scenario: 'studentViewPrograms' },
      // Student tracks workout
      { action: 'executeScenario', scenario: 'studentTrackWorkout' },
      // Student earns badges
      { action: 'executeScenario', scenario: 'studentEarnsBadges' },
      // Final verification
      {
        action: 'verify',
        condition: 'allScenariosComplete',
      },
    ],
  },
};

/**
 * Test verification conditions
 */
export const VERIFICATION_CONDITIONS = {
  programPublished: (page: any) => {
    return page.locator('text=Published successfully').isVisible();
  },

  programAssigned: (page: any, expected: string) => {
    return page.locator(`text=${expected}`).isVisible();
  },

  programVisible: (page: any, expected: string) => {
    return page.locator(`text=${expected}`).isVisible();
  },

  programDetailsVisible: (page: any, expectedValues: string[]) => {
    return Promise.all(
      expectedValues.map((val) =>
        page.locator(`text=${val}`).isVisible(),
      ),
    );
  },

  sessionsDisplayed: (page: any) => {
    return page.locator('[class*="session-card"]').count().then((c: number) => c > 0);
  },

  workoutPageLoaded: (page: any, expectedValues: string[]) => {
    return Promise.all(
      expectedValues.map((val) =>
        page.locator(`text=${val}`).isVisible(),
      ),
    );
  },

  sessionCompleted: (page: any) => {
    return page.locator('text=Séance complétée').isVisible();
  },

  badgeVisible: (page: any, expected: string) => {
    return page.locator(`text=${expected}`).isVisible();
  },

  statsUpdated: (page: any, expectedValues: Record<string, any>) => {
    return Promise.all(
      Object.entries(expectedValues).map(([key, value]) =>
        page.locator(`text=${value}`).isVisible(),
      ),
    );
  },

  allScenariosComplete: () => {
    return true; // All previous verifications passed
  },
};
