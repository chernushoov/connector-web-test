// ============================================
// AI Agent Task Runner
// Core module that orchestrates all agent tasks
// ============================================

import {
  AgentTask,
  TaskResult,
  TaskStatus,
  AgentModule,
  AgentLog,
  TaskPriority
} from './types'
import { AGENT_CONFIG } from './config'

// ============================================
// Task Runner Class
// ============================================

export class TaskRunner {
  private tasks: Map<string, AgentTask> = new Map()
  private logs: AgentLog[] = []
  private isRunning: boolean = false

  // ============================================
  // Task Management
  // ============================================

  /**
   * Create a new task
   */
  createTask(
    module: AgentModule,
    name: string,
    description: string,
    priority: TaskPriority = 'medium',
    metadata?: Record<string, unknown>
  ): AgentTask {
    const task: AgentTask = {
      id: this.generateId(),
      module,
      name,
      description,
      priority,
      status: 'pending',
      createdAt: new Date(),
      metadata,
    }

    this.tasks.set(task.id, task)
    this.log('info', module, `Task created: ${name}`, task.id)

    return task
  }

  /**
   * Update task status
   */
  updateTaskStatus(taskId: string, status: TaskStatus, result?: TaskResult, error?: string): void {
    const task = this.tasks.get(taskId)
    if (!task) {
      this.log('warn', 'moderation', `Task not found: ${taskId}`)
      return
    }

    task.status = status

    if (status === 'running') {
      task.startedAt = new Date()
    }

    if (status === 'completed' || status === 'failed') {
      task.completedAt = new Date()
    }

    if (result) {
      task.result = result
    }

    if (error) {
      task.error = error
    }

    this.tasks.set(taskId, task)
    this.log('info', task.module, `Task ${taskId} status: ${status}`, taskId)
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId)
  }

  /**
   * Get all tasks
   */
  getAllTasks(): AgentTask[] {
    return Array.from(this.tasks.values())
  }

  /**
   * Get pending tasks by module
   */
  getPendingTasks(module?: AgentModule): AgentTask[] {
    return this.getAllTasks()
      .filter(t => t.status === 'pending')
      .filter(t => !module || t.module === module)
      .sort((a, b) => {
        // Sort by priority (critical > high > medium > low)
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
  }

  // ============================================
  // Execution
  // ============================================

  /**
   * Run a task with a handler function
   */
  async runTask<T>(
    task: AgentTask,
    handler: () => Promise<T>
  ): Promise<{ success: boolean; result?: T; error?: string }> {
    if (!AGENT_CONFIG.enabled) {
      this.log('warn', task.module, 'Agent is disabled, skipping task', task.id)
      this.updateTaskStatus(task.id, 'skipped')
      return { success: false, error: 'Agent disabled' }
    }

    const startTime = Date.now()
    this.updateTaskStatus(task.id, 'running')

    try {
      const result = await handler()
      const duration = Date.now() - startTime

      this.updateTaskStatus(task.id, 'completed', {
        success: true,
        itemsProcessed: 1,
        itemsFlagged: 0,
        itemsApproved: 0,
        itemsRejected: 0,
        duration,
      })

      this.log('info', task.module, `Task completed in ${duration}ms`, task.id)
      return { success: true, result }

    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error'
      const duration = Date.now() - startTime

      this.updateTaskStatus(task.id, 'failed', {
        success: false,
        itemsProcessed: 0,
        itemsFlagged: 0,
        itemsApproved: 0,
        itemsRejected: 0,
        duration,
      }, error)

      this.log('error', task.module, `Task failed: ${error}`, task.id)
      return { success: false, error }
    }
  }

  /**
   * Run multiple tasks in batch
   */
  async runBatch<T>(
    tasks: AgentTask[],
    handler: (task: AgentTask) => Promise<T>,
    concurrency: number = 5
  ): Promise<Map<string, { success: boolean; result?: T; error?: string }>> {
    const results = new Map<string, { success: boolean; result?: T; error?: string }>()

    // Process in batches
    for (let i = 0; i < tasks.length; i += concurrency) {
      const batch = tasks.slice(i, i + concurrency)
      const batchPromises = batch.map(task =>
        this.runTask(task, () => handler(task))
          .then(result => ({ taskId: task.id, ...result }))
      )

      const batchResults = await Promise.all(batchPromises)
      batchResults.forEach(r => results.set(r.taskId, r))
    }

    return results
  }

  // ============================================
  // Logging
  // ============================================

  /**
   * Add a log entry
   */
  log(
    level: AgentLog['level'],
    module: AgentModule,
    message: string,
    taskId?: string,
    metadata?: Record<string, unknown>
  ): void {
    const logEntry: AgentLog = {
      id: this.generateId(),
      timestamp: new Date(),
      module,
      level,
      message,
      taskId,
      metadata,
    }

    this.logs.push(logEntry)

    // Keep only last 1000 logs in memory
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000)
    }

    // Console output for debugging
    const prefix = `[Agent/${module}]`
    switch (level) {
      case 'error':
        console.error(prefix, message, metadata || '')
        break
      case 'warn':
        console.warn(prefix, message, metadata || '')
        break
      case 'info':
        console.log(prefix, message, metadata || '')
        break
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(prefix, message, metadata || '')
        }
        break
    }
  }

  /**
   * Get logs
   */
  getLogs(
    module?: AgentModule,
    level?: AgentLog['level'],
    limit: number = 100
  ): AgentLog[] {
    return this.logs
      .filter(l => !module || l.module === module)
      .filter(l => !level || l.level === level)
      .slice(-limit)
  }

  // ============================================
  // Stats
  // ============================================

  /**
   * Get task statistics
   */
  getStats(): {
    total: number
    pending: number
    running: number
    completed: number
    failed: number
    skipped: number
    byModule: Record<AgentModule, number>
    avgDuration: number
  } {
    const tasks = this.getAllTasks()

    const byModule: Record<AgentModule, number> = {
      moderation: 0,
      notifications: 0,
      fraud: 0,
      analytics: 0,
      reports: 0,
    }

    let totalDuration = 0
    let completedCount = 0

    for (const task of tasks) {
      byModule[task.module]++
      if (task.result?.duration) {
        totalDuration += task.result.duration
        completedCount++
      }
    }

    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      running: tasks.filter(t => t.status === 'running').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      skipped: tasks.filter(t => t.status === 'skipped').length,
      byModule,
      avgDuration: completedCount > 0 ? totalDuration / completedCount : 0,
    }
  }

  // ============================================
  // Cleanup
  // ============================================

  /**
   * Clear old tasks
   */
  clearOldTasks(olderThanHours: number = 24): number {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000)
    let removed = 0

    for (const [id, task] of Array.from(this.tasks)) {
      if (task.completedAt && task.completedAt < cutoff) {
        this.tasks.delete(id)
        removed++
      }
    }

    if (removed > 0) {
      this.log('info', 'analytics', `Cleared ${removed} old tasks`)
    }

    return removed
  }

  // ============================================
  // Utilities
  // ============================================

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// ============================================
// Singleton Instance
// ============================================

let taskRunnerInstance: TaskRunner | null = null

export function getTaskRunner(): TaskRunner {
  if (!taskRunnerInstance) {
    taskRunnerInstance = new TaskRunner()
  }
  return taskRunnerInstance
}

// ============================================
// Helper Functions
// ============================================

/**
 * Wait for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (i < maxRetries - 1) {
        await sleep(initialDelay * Math.pow(2, i))
      }
    }
  }

  throw lastError
}

/**
 * Format duration in human readable format
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`
}
