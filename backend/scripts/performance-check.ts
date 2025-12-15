/**
 * Performance Check Script
 * Automatically benchmarks queries and detects performance issues
 * Used by Gate #3 validation
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface QueryLog {
  timestamp: string;
  query: string;
  params: string;
  duration: number;
  target: string;
}

interface PerformanceReport {
  timestamp: string;
  totalQueries: number;
  slowQueries: QueryLog[];
  n1Detected: boolean;
  averageDuration: number;
  p95Duration: number;
  maxDuration: number;
  passed: boolean;
  issues: string[];
}

class PerformanceChecker {
  private prisma: PrismaClient;
  private queryLogs: QueryLog[] = [];
  private readonly SLOW_QUERY_THRESHOLD = 500; // ms
  private readonly TARGET_THRESHOLD = 200; // ms (warning)

  constructor() {
    this.prisma = new PrismaClient({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
      ],
    });

    // Capture query logs
    this.prisma.$on('query' as never, (e: any) => {
      this.queryLogs.push({
        timestamp: new Date().toISOString(),
        query: e.query,
        params: e.params,
        duration: e.duration,
        target: e.target,
      });
    });
  }

  /**
   * Run benchmark on all critical endpoints
   */
  async runBenchmarks(): Promise<PerformanceReport> {
    console.log('🚀 Starting performance benchmarks...\n');

    this.queryLogs = []; // Reset logs

    // Benchmark 1: Exercise queries
    await this.benchmarkExerciseQueries();

    // Benchmark 2: Program queries
    await this.benchmarkProgramQueries();

    // Benchmark 3: Session queries
    await this.benchmarkSessionQueries();

    // Generate report
    const report = this.generateReport();

    // Output report
    this.printReport(report);

    // Save report to file
    this.saveReport(report);

    return report;
  }

  private async benchmarkExerciseQueries() {
    console.log('📊 Benchmarking Exercise queries...');

    try {
      // Simulate typical exercise queries
      const userId = 'test-user-id'; // Mock user

      // Query 1: Find all exercises
      await this.prisma.exercise.findMany({
        where: { userId },
        take: 20,
      });

      // Query 2: Find exercise with filters
      await this.prisma.exercise.findMany({
        where: {
          userId,
          name: { contains: 'squat' },
        },
      });

      // Query 3: Find exercise with relations (check N+1)
      const exercises = await this.prisma.exercise.findMany({
        where: { userId },
        include: {
          user: true,
        },
        take: 10,
      });

      console.log(`✅ Exercise queries: ${exercises.length} results\n`);
    } catch (error) {
      console.log(`⚠️  Exercise queries failed: ${error.message}\n`);
    }
  }

  private async benchmarkProgramQueries() {
    console.log('📊 Benchmarking Program queries...');

    try {
      const userId = 'test-user-id';

      // Query 1: Find all programs with workouts
      await this.prisma.program.findMany({
        where: { userId },
        include: {
          workouts: true,
        },
        take: 10,
      });

      console.log(`✅ Program queries complete\n`);
    } catch (error) {
      console.log(`⚠️  Program queries failed: ${error.message}\n`);
    }
  }

  private async benchmarkSessionQueries() {
    console.log('📊 Benchmarking Session queries...');

    try {
      const userId = 'test-user-id';

      // Query 1: Find recent sessions
      await this.prisma.workoutSession.findMany({
        where: { userId },
        include: {
          workout: true,
          sessionProgress: true,
        },
        orderBy: { startedAt: 'desc' },
        take: 20,
      });

      console.log(`✅ Session queries complete\n`);
    } catch (error) {
      console.log(`⚠️  Session queries failed: ${error.message}\n`);
    }
  }

  /**
   * Detect N+1 query problems
   */
  private detectN1Queries(): boolean {
    // Group queries by target (table)
    const queryGroups = this.queryLogs.reduce((acc, log) => {
      if (!acc[log.target]) {
        acc[log.target] = [];
      }
      acc[log.target].push(log);
      return acc;
    }, {} as Record<string, QueryLog[]>);

    // Check for repeated queries (potential N+1)
    for (const [target, queries] of Object.entries(queryGroups)) {
      if (queries.length > 10) {
        // More than 10 queries to same table = likely N+1
        console.log(
          `⚠️  Potential N+1 detected: ${queries.length} queries to ${target}`,
        );
        return true;
      }
    }

    return false;
  }

  /**
   * Generate performance report
   */
  private generateReport(): PerformanceReport {
    const slowQueries = this.queryLogs.filter(
      (log) => log.duration > this.SLOW_QUERY_THRESHOLD,
    );
    const n1Detected = this.detectN1Queries();

    const durations = this.queryLogs.map((log) => log.duration);
    const averageDuration =
      durations.reduce((a, b) => a + b, 0) / durations.length || 0;
    const p95Duration = this.calculateP95(durations);
    const maxDuration = Math.max(...durations, 0);

    const issues: string[] = [];

    if (slowQueries.length > 0) {
      issues.push(
        `${slowQueries.length} slow queries detected (>${this.SLOW_QUERY_THRESHOLD}ms)`,
      );
    }

    if (n1Detected) {
      issues.push('N+1 query problem detected');
    }

    if (p95Duration > this.TARGET_THRESHOLD) {
      issues.push(
        `p95 duration ${p95Duration}ms exceeds target ${this.TARGET_THRESHOLD}ms`,
      );
    }

    const passed = slowQueries.length === 0 && !n1Detected;

    return {
      timestamp: new Date().toISOString(),
      totalQueries: this.queryLogs.length,
      slowQueries,
      n1Detected,
      averageDuration: Math.round(averageDuration),
      p95Duration: Math.round(p95Duration),
      maxDuration: Math.round(maxDuration),
      passed,
      issues,
    };
  }

  /**
   * Calculate p95 percentile
   */
  private calculateP95(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * 0.95) - 1;
    return sorted[index] || 0;
  }

  /**
   * Print report to console
   */
  private printReport(report: PerformanceReport) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚡ PERFORMANCE REPORT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`📊 Summary:`);
    console.log(`   Total Queries: ${report.totalQueries}`);
    console.log(`   Average Duration: ${report.averageDuration}ms`);
    console.log(`   p95 Duration: ${report.p95Duration}ms`);
    console.log(`   Max Duration: ${report.maxDuration}ms\n`);

    if (report.slowQueries.length > 0) {
      console.log(
        `🐢 Slow Queries (>${this.SLOW_QUERY_THRESHOLD}ms): ${report.slowQueries.length}`,
      );
      report.slowQueries.forEach((query, i) => {
        console.log(`\n   ${i + 1}. Duration: ${query.duration}ms`);
        console.log(`      Target: ${query.target}`);
        console.log(`      Query: ${query.query.substring(0, 100)}...`);
      });
      console.log('');
    }

    if (report.n1Detected) {
      console.log('⚠️  N+1 Query Problem: DETECTED');
      console.log('   Use Prisma "include" or "select" to fetch relations\n');
    }

    if (report.issues.length > 0) {
      console.log('❌ Issues:');
      report.issues.forEach((issue) => console.log(`   - ${issue}`));
      console.log('');
    }

    if (report.passed) {
      console.log('✅ Performance Check: PASSED\n');
    } else {
      console.log('❌ Performance Check: FAILED\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Save report to file
   */
  private saveReport(report: PerformanceReport) {
    const reportsDir = path.join(__dirname, '..', 'performance-reports');

    // Create directory if not exists
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filename = `performance-${Date.now()}.json`;
    const filepath = path.join(reportsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));

    console.log(`📄 Report saved: ${filepath}\n`);
  }

  async close() {
    await this.prisma.$disconnect();
  }
}

/**
 * Main execution
 */
async function main() {
  const checker = new PerformanceChecker();

  try {
    const report = await checker.runBenchmarks();

    // Exit with error code if checks failed
    if (!report.passed) {
      console.error('Performance checks failed. Fix issues above.');
      process.exit(1);
    }

    console.log('All performance checks passed! ✅');
    process.exit(0);
  } catch (error) {
    console.error('Performance check error:', error);
    process.exit(1);
  } finally {
    await checker.close();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { PerformanceChecker, PerformanceReport };
