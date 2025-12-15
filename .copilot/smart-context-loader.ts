/**
 * Smart Context Loader
 * 
 * Intelligent context loading system for GitHub Copilot agents.
 * Features:
 * - File relevance scoring based on task context
 * - Dependency analysis and graph traversal
 * - Token budget management (avoid context overflow)
 * - Context caching for performance
 * - Priority-based file loading
 * 
 * @version 1.0.0
 * @author GoBeyondFit Agent System
 */

import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// Types & Interfaces
// =============================================================================

export interface FileContext {
  filePath: string;
  content: string;
  relevanceScore: number;
  tokens: number;
  lastModified: Date;
  dependencies: string[];
  type: FileType;
}

export interface ContextLoadOptions {
  taskDescription: string;
  maxTokens: number;
  includeTests: boolean;
  includeDocs: boolean;
  priorityFiles?: string[];
  excludePatterns?: string[];
}

export interface LoadResult {
  files: FileContext[];
  totalTokens: number;
  filesLoaded: number;
  filesSkipped: number;
  executionTime: number;
}

export enum FileType {
  SOURCE = 'source',
  TEST = 'test',
  CONFIG = 'config',
  DOCUMENTATION = 'documentation',
  AGENT = 'agent',
  SCHEMA = 'schema',
}

interface DependencyGraph {
  [filePath: string]: string[];
}

interface CacheEntry {
  content: string;
  tokens: number;
  timestamp: number;
  hash: string;
}

// =============================================================================
// Constants
// =============================================================================

const WORKSPACE_ROOT = process.cwd();
const CACHE_DIR = path.join(WORKSPACE_ROOT, '.copilot', 'cache');
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const AVERAGE_CHARS_PER_TOKEN = 4; // Rough estimate

const FILE_TYPE_PATTERNS: Record<FileType, RegExp[]> = {
  [FileType.SOURCE]: [
    /\.(ts|js|tsx|jsx)$/,
    /src\/.*\.(ts|js|tsx|jsx)$/,
  ],
  [FileType.TEST]: [
    /\.(spec|test)\.(ts|js|tsx|jsx)$/,
    /test\/.*\.(ts|js|tsx|jsx)$/,
  ],
  [FileType.CONFIG]: [
    /\.(json|yml|yaml|env|config\.(ts|js))$/,
    /(package\.json|tsconfig\.json|nest-cli\.json)/,
  ],
  [FileType.DOCUMENTATION]: [
    /\.(md|txt)$/,
    /Documentation\/.*\.md$/,
  ],
  [FileType.AGENT]: [
    /\.copilot\/agents\/.*\.md$/,
  ],
  [FileType.SCHEMA]: [
    /prisma\/schema\.prisma$/,
    /\.sql$/,
  ],
};

const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /coverage/,
  /\.next/,
];

// Keywords for relevance scoring
const RELEVANCE_KEYWORDS = {
  security: ['auth', 'jwt', 'guard', 'userId', 'multi-tenant', 'prisma', 'security'],
  performance: ['query', 'index', 'cache', 'optimize', 'benchmark', 'n+1'],
  api: ['controller', 'service', 'dto', 'endpoint', 'route', '@Get', '@Post'],
  database: ['prisma', 'schema', 'migration', 'model', 'query'],
  frontend: ['component', 'page', 'hook', 'tsx', 'jsx', 'react'],
  testing: ['test', 'spec', 'e2e', 'mock', 'jest', 'expect'],
};

// =============================================================================
// Smart Context Loader Class
// =============================================================================

export class SmartContextLoader {
  private cache: Map<string, CacheEntry> = new Map();
  private dependencyGraph: DependencyGraph = {};

  constructor() {
    this.initializeCache();
  }

  /**
   * Load context intelligently based on task description and constraints
   */
  async loadContext(options: ContextLoadOptions): Promise<LoadResult> {
    const startTime = Date.now();
    
    // Step 1: Discover all relevant files
    const allFiles = await this.discoverFiles(options);
    
    // Step 2: Score files by relevance
    const scoredFiles = this.scoreFileRelevance(allFiles, options.taskDescription);
    
    // Step 3: Build dependency graph
    await this.buildDependencyGraph(scoredFiles);
    
    // Step 4: Expand context with dependencies
    const expandedFiles = this.expandWithDependencies(scoredFiles, options);
    
    // Step 5: Load files respecting token budget
    const loadedFiles = await this.loadFilesWithBudget(expandedFiles, options);
    
    const executionTime = Date.now() - startTime;
    const totalTokens = loadedFiles.reduce((sum, f) => sum + f.tokens, 0);
    
    return {
      files: loadedFiles,
      totalTokens,
      filesLoaded: loadedFiles.length,
      filesSkipped: expandedFiles.length - loadedFiles.length,
      executionTime,
    };
  }

  /**
   * Discover all files in workspace matching criteria
   */
  private async discoverFiles(options: ContextLoadOptions): Promise<string[]> {
    const files: string[] = [];
    
    const walk = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(WORKSPACE_ROOT, fullPath);
        
        // Skip excluded patterns
        if (EXCLUDE_PATTERNS.some(pattern => pattern.test(relativePath))) {
          continue;
        }
        
        // Skip based on options
        if (!options.includeTests && relativePath.includes('test')) {
          continue;
        }
        
        if (!options.includeDocs && relativePath.includes('Documentation')) {
          continue;
        }
        
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile()) {
          files.push(relativePath);
        }
      }
    };
    
    walk(WORKSPACE_ROOT);
    return files;
  }

  /**
   * Score files by relevance to task description
   */
  private scoreFileRelevance(files: string[], taskDescription: string): Array<{ file: string; score: number }> {
    const taskLower = taskDescription.toLowerCase();
    const taskKeywords = this.extractKeywords(taskLower);
    
    return files.map(file => {
      let score = 0;
      const fileLower = file.toLowerCase();
      
      // Priority files get max score
      score += fileLower.includes('orchestrator') ? 50 : 0;
      score += fileLower.includes('security') ? 40 : 0;
      
      // Keyword matching
      for (const [category, keywords] of Object.entries(RELEVANCE_KEYWORDS)) {
        if (taskKeywords.some(tk => keywords.includes(tk))) {
          keywords.forEach(keyword => {
            if (fileLower.includes(keyword)) {
              score += 10;
            }
          });
        }
      }
      
      // File type bonuses
      if (FILE_TYPE_PATTERNS[FileType.SOURCE].some(p => p.test(file))) {
        score += 5;
      }
      
      // Recently modified files (if we can check)
      try {
        const stats = fs.statSync(path.join(WORKSPACE_ROOT, file));
        const ageInDays = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);
        if (ageInDays < 7) score += 15;
        else if (ageInDays < 30) score += 5;
      } catch {
        // Ignore errors
      }
      
      // Direct file name match
      if (fileLower.includes(taskLower.replace(/\s+/g, '-'))) {
        score += 30;
      }
      
      return { file, score };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Extract keywords from task description
   */
  private extractKeywords(text: string): string[] {
    const words = text.split(/\s+/);
    return words.filter(word => word.length > 3); // Simple filtering
  }

  /**
   * Build dependency graph from imports/requires
   */
  private async buildDependencyGraph(scoredFiles: Array<{ file: string; score: number }>): Promise<void> {
    for (const { file } of scoredFiles.slice(0, 50)) { // Limit to top 50 files
      const filePath = path.join(WORKSPACE_ROOT, file);
      
      try {
        const content = await this.getCachedContent(filePath);
        const dependencies = this.extractDependencies(content, file);
        this.dependencyGraph[file] = dependencies;
      } catch {
        this.dependencyGraph[file] = [];
      }
    }
  }

  /**
   * Extract dependencies from file content (imports/requires)
   */
  private extractDependencies(content: string, currentFile: string): string[] {
    const dependencies: string[] = [];
    
    // Match ES6 imports: import ... from './path'
    const importRegex = /import\s+.*\s+from\s+['"](.+?)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      if (importPath.startsWith('.')) {
        // Resolve relative path
        const currentDir = path.dirname(currentFile);
        const resolved = path.normalize(path.join(currentDir, importPath));
        dependencies.push(resolved);
      }
    }
    
    // Match CommonJS requires: require('./path')
    const requireRegex = /require\(['"](.+?)['"]\)/g;
    
    while ((match = requireRegex.exec(content)) !== null) {
      const requirePath = match[1];
      if (requirePath.startsWith('.')) {
        const currentDir = path.dirname(currentFile);
        const resolved = path.normalize(path.join(currentDir, requirePath));
        dependencies.push(resolved);
      }
    }
    
    return dependencies;
  }

  /**
   * Expand file list with dependencies (breadth-first)
   */
  private expandWithDependencies(
    scoredFiles: Array<{ file: string; score: number }>,
    options: ContextLoadOptions
  ): Array<{ file: string; score: number }> {
    const expanded = new Map<string, number>();
    const queue: string[] = [];
    
    // Start with priority files
    if (options.priorityFiles) {
      for (const file of options.priorityFiles) {
        expanded.set(file, 100);
        queue.push(file);
      }
    }
    
    // Add scored files
    for (const { file, score } of scoredFiles) {
      if (!expanded.has(file)) {
        expanded.set(file, score);
        queue.push(file);
      }
    }
    
    // BFS expansion (limited depth)
    const visited = new Set<string>();
    let depth = 0;
    const maxDepth = 2;
    
    while (queue.length > 0 && depth < maxDepth) {
      const levelSize = queue.length;
      
      for (let i = 0; i < levelSize; i++) {
        const file = queue.shift()!;
        if (visited.has(file)) continue;
        visited.add(file);
        
        const deps = this.dependencyGraph[file] || [];
        for (const dep of deps) {
          if (!expanded.has(dep)) {
            const inheritedScore = (expanded.get(file) || 0) * 0.7; // Reduce score for dependencies
            expanded.set(dep, inheritedScore);
            queue.push(dep);
          }
        }
      }
      
      depth++;
    }
    
    return Array.from(expanded.entries())
      .map(([file, score]) => ({ file, score }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Load files respecting token budget
   */
  private async loadFilesWithBudget(
    scoredFiles: Array<{ file: string; score: number }>,
    options: ContextLoadOptions
  ): Promise<FileContext[]> {
    const loaded: FileContext[] = [];
    let totalTokens = 0;
    
    for (const { file, score } of scoredFiles) {
      const filePath = path.join(WORKSPACE_ROOT, file);
      
      try {
        const content = await this.getCachedContent(filePath);
        const tokens = this.estimateTokens(content);
        
        // Check if adding this file would exceed budget
        if (totalTokens + tokens > options.maxTokens) {
          break; // Budget exhausted
        }
        
        const stats = fs.statSync(filePath);
        const fileContext: FileContext = {
          filePath: file,
          content,
          relevanceScore: score,
          tokens,
          lastModified: stats.mtime,
          dependencies: this.dependencyGraph[file] || [],
          type: this.determineFileType(file),
        };
        
        loaded.push(fileContext);
        totalTokens += tokens;
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }
    
    return loaded;
  }

  /**
   * Get file content from cache or disk
   */
  private async getCachedContent(filePath: string): Promise<string> {
    const stats = fs.statSync(filePath);
    const hash = `${filePath}-${stats.mtimeMs}`;
    
    const cached = this.cache.get(filePath);
    if (cached && cached.hash === hash && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.content;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    
    this.cache.set(filePath, {
      content,
      tokens: this.estimateTokens(content),
      timestamp: Date.now(),
      hash,
    });
    
    return content;
  }

  /**
   * Estimate token count for content
   */
  private estimateTokens(content: string): number {
    return Math.ceil(content.length / AVERAGE_CHARS_PER_TOKEN);
  }

  /**
   * Determine file type from path
   */
  private determineFileType(filePath: string): FileType {
    for (const [type, patterns] of Object.entries(FILE_TYPE_PATTERNS)) {
      if (patterns.some(pattern => pattern.test(filePath))) {
        return type as FileType;
      }
    }
    return FileType.SOURCE;
  }

  /**
   * Initialize cache directory
   */
  private initializeCache(): void {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  }

  /**
   * Clear cache (for testing/debugging)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // TODO: Track hits/misses
    };
  }
}

// =============================================================================
// Usage Example
// =============================================================================

async function example() {
  const loader = new SmartContextLoader();
  
  const result = await loader.loadContext({
    taskDescription: 'Add exercise filtering by muscle group with security validation',
    maxTokens: 50000,
    includeTests: true,
    includeDocs: false,
    priorityFiles: [
      'backend/src/exercises/exercises.service.ts',
      '.copilot/agents/01-security-agent.md',
    ],
  });
  
  console.log(`Loaded ${result.filesLoaded} files (${result.totalTokens} tokens)`);
  console.log(`Skipped ${result.filesSkipped} files due to token budget`);
  console.log(`Execution time: ${result.executionTime}ms`);
  
  // Files are sorted by relevance
  result.files.slice(0, 5).forEach(file => {
    console.log(`- ${file.filePath} (score: ${file.relevanceScore}, tokens: ${file.tokens})`);
  });
}

// Export for agent usage
export default SmartContextLoader;
