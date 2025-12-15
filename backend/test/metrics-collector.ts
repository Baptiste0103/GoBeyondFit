import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Test Metrics Collector
 * 
 * Tracks test execution metrics over time:
 * - Execution times per test suite
 * - Coverage trends
 * - Flaky test detection
 * - Performance regression detection
 */

interface TestMetric {
  suiteName: string;
  testName: string;
  duration: number;
  status: 'passed' | 'failed' | 'skipped';
  timestamp: Date;
  memoryUsage?: number;
}

interface TestSuiteMetrics {
  suiteName: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  coverage?: CoverageMetrics;
  timestamp: Date;
}

interface CoverageMetrics {
  lines: { total: number; covered: number; pct: number };
  statements: { total: number; covered: number; pct: number };
  functions: { total: number; covered: number; pct: number };
  branches: { total: number; covered: number; pct: number };
}

interface FlakyTest {
  testName: string;
  suiteName: string;
  failures: number;
  totalRuns: number;
  failureRate: number;
  lastFailure: Date;
}

interface PerformanceRegression {
  suiteName: string;
  previousDuration: number;
  currentDuration: number;
  regressionPct: number;
  timestamp: Date;
}

interface MetricsReport {
  timestamp: Date;
  summary: {
    totalSuites: number;
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    totalDuration: number;
    averageDuration: number;
  };
  suites: TestSuiteMetrics[];
  flakyTests: FlakyTest[];
  performanceRegressions: PerformanceRegression[];
  trends: {
    passingRate: number;
    averageDuration: number;
    coverageTrend: string; // 'improving' | 'stable' | 'declining'
  };
}

export class MetricsCollector {
  private metricsDir: string;
  private currentRunMetrics: TestMetric[] = [];
  private suiteMetrics: Map<string, TestSuiteMetrics> = new Map();

  constructor(metricsDir: string = './test-metrics') {
    this.metricsDir = metricsDir;
  }

  /**
   * Initialize metrics directory
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.metricsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create metrics directory:', error);
    }
  }

  /**
   * Record a single test execution
   */
  recordTest(
    suiteName: string,
    testName: string,
    duration: number,
    status: 'passed' | 'failed' | 'skipped',
    memoryUsage?: number,
  ): void {
    const metric: TestMetric = {
      suiteName,
      testName,
      duration,
      status,
      timestamp: new Date(),
      memoryUsage,
    };

    this.currentRunMetrics.push(metric);
  }

  /**
   * Record test suite metrics
   */
  recordSuite(metrics: TestSuiteMetrics): void {
    this.suiteMetrics.set(metrics.suiteName, metrics);
  }

  /**
   * Finalize and save current test run metrics
   */
  async saveMetrics(): Promise<void> {
    await this.initialize();

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `metrics-${timestamp}.json`;
    const filepath = path.join(this.metricsDir, filename);

    const metrics = {
      timestamp: new Date(),
      tests: this.currentRunMetrics,
      suites: Array.from(this.suiteMetrics.values()),
    };

    await fs.writeFile(filepath, JSON.stringify(metrics, null, 2));
    console.log(`✅ Metrics saved to: ${filepath}`);

    // Also save to latest.json for quick access
    const latestPath = path.join(this.metricsDir, 'latest.json');
    await fs.writeFile(latestPath, JSON.stringify(metrics, null, 2));
  }

  /**
   * Load historical metrics
   */
  async loadHistoricalMetrics(limit: number = 10): Promise<any[]> {
    try {
      const files = await fs.readdir(this.metricsDir);
      const metricsFiles = files
        .filter((f) => f.startsWith('metrics-') && f.endsWith('.json'))
        .sort()
        .reverse()
        .slice(0, limit);

      const metrics = await Promise.all(
        metricsFiles.map(async (file) => {
          const content = await fs.readFile(
            path.join(this.metricsDir, file),
            'utf-8',
          );
          return JSON.parse(content);
        }),
      );

      return metrics;
    } catch (error) {
      console.error('Failed to load historical metrics:', error);
      return [];
    }
  }

  /**
   * Detect flaky tests (tests that fail intermittently)
   */
  async detectFlakyTests(threshold: number = 0.2): Promise<FlakyTest[]> {
    const historical = await this.loadHistoricalMetrics(20);
    const testResults = new Map<
      string,
      { failures: number; total: number; lastFailure?: Date }
    >();

    // Aggregate test results
    for (const metrics of historical) {
      for (const test of metrics.tests || []) {
        const key = `${test.suiteName}::${test.testName}`;
        const current = testResults.get(key) || {
          failures: 0,
          total: 0,
        };

        current.total++;
        if (test.status === 'failed') {
          current.failures++;
          current.lastFailure = new Date(test.timestamp);
        }

        testResults.set(key, current);
      }
    }

    // Find flaky tests (failure rate between threshold and 80%)
    const flakyTests: FlakyTest[] = [];
    testResults.forEach((stats, key) => {
      const failureRate = stats.failures / stats.total;
      if (
        failureRate >= threshold &&
        failureRate < 0.8 &&
        stats.total >= 5
      ) {
        const [suiteName, testName] = key.split('::');
        flakyTests.push({
          suiteName,
          testName,
          failures: stats.failures,
          totalRuns: stats.total,
          failureRate,
          lastFailure: stats.lastFailure || new Date(),
        });
      }
    });

    return flakyTests.sort((a, b) => b.failureRate - a.failureRate);
  }

  /**
   * Detect performance regressions (tests taking significantly longer)
   */
  async detectPerformanceRegressions(
    threshold: number = 1.5,
  ): Promise<PerformanceRegression[]> {
    const historical = await this.loadHistoricalMetrics(10);
    if (historical.length < 2) {
      return [];
    }

    const current = historical[0];
    const previous = historical[1];

    const regressions: PerformanceRegression[] = [];

    // Compare suite durations
    for (const currentSuite of current.suites || []) {
      const previousSuite = (previous.suites || []).find(
        (s) => s.suiteName === currentSuite.suiteName,
      );

      if (previousSuite) {
        const ratio = currentSuite.duration / previousSuite.duration;
        if (ratio >= threshold) {
          regressions.push({
            suiteName: currentSuite.suiteName,
            previousDuration: previousSuite.duration,
            currentDuration: currentSuite.duration,
            regressionPct: (ratio - 1) * 100,
            timestamp: new Date(currentSuite.timestamp),
          });
        }
      }
    }

    return regressions.sort((a, b) => b.regressionPct - a.regressionPct);
  }

  /**
   * Calculate coverage trends
   */
  async calculateCoverageTrend(): Promise<{
    current: number;
    trend: 'improving' | 'stable' | 'declining';
    history: number[];
  }> {
    const historical = await this.loadHistoricalMetrics(5);
    const coverages: number[] = [];

    for (const metrics of historical) {
      const avgCoverage =
        (metrics.suites || []).reduce((sum, suite) => {
          return (
            sum +
            (suite.coverage?.lines?.pct || 0)
          );
        }, 0) / (metrics.suites?.length || 1);
      coverages.push(avgCoverage);
    }

    if (coverages.length === 0) {
      return { current: 0, trend: 'stable', history: [] };
    }

    const current = coverages[0];
    const previous = coverages[1] || current;

    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (current > previous + 1) {
      trend = 'improving';
    } else if (current < previous - 1) {
      trend = 'declining';
    }

    return { current, trend, history: coverages };
  }

  /**
   * Generate comprehensive metrics report
   */
  async generateReport(): Promise<MetricsReport> {
    const historical = await this.loadHistoricalMetrics(1);
    const current = historical[0] || {
      tests: [],
      suites: [],
      timestamp: new Date(),
    };

    const flakyTests = await this.detectFlakyTests();
    const regressions = await this.detectPerformanceRegressions();
    const coverageTrend = await this.calculateCoverageTrend();

    const totalTests = current.tests?.length || 0;
    const passed =
      current.tests?.filter((t) => t.status === 'passed').length || 0;
    const failed =
      current.tests?.filter((t) => t.status === 'failed').length || 0;
    const skipped =
      current.tests?.filter((t) => t.status === 'skipped').length || 0;
    const totalDuration =
      current.tests?.reduce((sum, t) => sum + t.duration, 0) || 0;

    const report: MetricsReport = {
      timestamp: new Date(current.timestamp),
      summary: {
        totalSuites: current.suites?.length || 0,
        totalTests,
        passed,
        failed,
        skipped,
        totalDuration,
        averageDuration: totalTests > 0 ? totalDuration / totalTests : 0,
      },
      suites: current.suites || [],
      flakyTests,
      performanceRegressions: regressions,
      trends: {
        passingRate: totalTests > 0 ? (passed / totalTests) * 100 : 0,
        averageDuration: totalTests > 0 ? totalDuration / totalTests : 0,
        coverageTrend: coverageTrend.trend,
      },
    };

    return report;
  }

  /**
   * Generate dashboard JSON for visualization
   */
  async generateDashboard(): Promise<void> {
    const report = await this.generateReport();
    const historical = await this.loadHistoricalMetrics(10);

    const dashboard = {
      currentRun: report,
      history: historical.map((m) => ({
        timestamp: m.timestamp,
        totalTests: m.tests?.length || 0,
        passed: m.tests?.filter((t) => t.status === 'passed').length || 0,
        failed: m.tests?.filter((t) => t.status === 'failed').length || 0,
        duration: m.tests?.reduce((sum, t) => sum + t.duration, 0) || 0,
      })),
      alerts: [
        ...report.flakyTests.map((ft) => ({
          type: 'flaky-test',
          severity: 'warning',
          message: `Flaky test: ${ft.testName} (${(ft.failureRate * 100).toFixed(1)}% failure rate)`,
        })),
        ...report.performanceRegressions.map((pr) => ({
          type: 'performance-regression',
          severity: 'warning',
          message: `Performance regression in ${pr.suiteName} (+${pr.regressionPct.toFixed(1)}%)`,
        })),
      ],
    };

    const dashboardPath = path.join(this.metricsDir, 'dashboard.json');
    await fs.writeFile(dashboardPath, JSON.stringify(dashboard, null, 2));
    console.log(`📊 Dashboard generated: ${dashboardPath}`);
  }

  /**
   * Print metrics summary to console
   */
  async printSummary(): Promise<void> {
    const report = await this.generateReport();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 TEST METRICS SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(
      `\n📈 Overview: ${report.summary.totalTests} tests in ${report.summary.totalSuites} suites`,
    );
    console.log(`  ✅ Passed: ${report.summary.passed}`);
    console.log(`  ❌ Failed: ${report.summary.failed}`);
    console.log(`  ⏭️  Skipped: ${report.summary.skipped}`);
    console.log(
      `  ⏱️  Duration: ${report.summary.totalDuration.toFixed(0)}ms (avg: ${report.summary.averageDuration.toFixed(0)}ms)`,
    );
    console.log(
      `  📊 Pass Rate: ${report.trends.passingRate.toFixed(1)}%`,
    );

    if (report.flakyTests.length > 0) {
      console.log(`\n⚠️  FLAKY TESTS DETECTED: ${report.flakyTests.length}`);
      report.flakyTests.slice(0, 3).forEach((ft) => {
        console.log(
          `  • ${ft.testName} - ${(ft.failureRate * 100).toFixed(1)}% failure rate`,
        );
      });
    }

    if (report.performanceRegressions.length > 0) {
      console.log(
        `\n⚠️  PERFORMANCE REGRESSIONS: ${report.performanceRegressions.length}`,
      );
      report.performanceRegressions.slice(0, 3).forEach((pr) => {
        console.log(
          `  • ${pr.suiteName} - +${pr.regressionPct.toFixed(1)}% slower`,
        );
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
}

// Export singleton instance
export const metricsCollector = new MetricsCollector();

// Jest reporter integration (optional)
export class MetricsReporter {
  private collector: MetricsCollector;

  constructor() {
    this.collector = new MetricsCollector();
  }

  async onRunStart(): Promise<void> {
    await this.collector.initialize();
  }

  async onTestResult(
    test: any,
    testResult: any,
    aggregatedResult: any,
  ): Promise<void> {
    const suiteName = path.basename(test.path, '.spec.ts');

    testResult.testResults.forEach((result: any) => {
      this.collector.recordTest(
        suiteName,
        result.fullName,
        result.duration || 0,
        result.status,
      );
    });

    this.collector.recordSuite({
      suiteName,
      totalTests: testResult.numPassingTests + testResult.numFailingTests,
      passed: testResult.numPassingTests,
      failed: testResult.numFailingTests,
      skipped: testResult.numPendingTests,
      duration: testResult.perfStats.runtime,
      timestamp: new Date(),
    });
  }

  async onRunComplete(): Promise<void> {
    await this.collector.saveMetrics();
    await this.collector.generateDashboard();
    await this.collector.printSummary();
  }
}

export default MetricsReporter;
