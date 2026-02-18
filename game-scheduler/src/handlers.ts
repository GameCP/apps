import type {
  ExtensionContext,
  ApiRouteHandler,
  TypedEventHandler,
} from '@gamecp/types';
import { CronExpressionParser } from 'cron-parser';

// Extension-specific types
interface ScheduledTask {
  _id?: string;
  serverId: string;
  name: string;
  action: 'start' | 'stop' | 'restart' | 'command' | 'execute_action';
  schedule: string;
  config?: {
    command?: string;

    actionId?: string;        // For execute_action type
    preWarning?: {
      enabled: boolean;
      minutes: number;         // Minutes before execution
      message: string;         // Warning message to broadcast
    };
    conditions?: {
      minPlayers?: number;     // Only run if >= N players
      maxPlayers?: number;     // Only run if <= N players
      requireRunning?: boolean; // Only run if server is running
    };
  };
  enabled: boolean;
  next_run: Date;
  last_run?: Date;
  last_status?: 'success' | 'failed';
  last_error?: string;
  created_at: Date;
}

interface TaskLog {
  taskId: string;
  serverId: string;
  taskName: string;
  action: string;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
  duration_ms?: number;
  executed_at: Date;
}

interface CronTickPayload {
  task: ScheduledTask;
}

/**
 * Get all scheduled tasks for a server
 */
export const getTasks: ApiRouteHandler = async (ctx) => {
  const { serverId } = ctx.request.query;

  if (!serverId) {
    return {
      status: 400,
      body: { error: 'serverId is required' }
    };
  }

  const tasks = await ctx.db.collection('schedules').find({ serverId }).toArray();

  return {
    status: 200,
    body: { tasks }
  };
};

/**
 * Get execution logs for a server
 */
export const getLogs: ApiRouteHandler = async (ctx) => {
  const { serverId, limit = '50' } = ctx.request.query;

  if (!serverId) {
    return {
      status: 400,
      body: { error: 'serverId is required' }
    };
  }

  const logs = await ctx.db.collection('task_logs')
    .find({ serverId })
    .toArray();

  // Sort by executed_at descending and limit
  const sorted = logs
    .sort((a: any, b: any) => new Date(b.executed_at).getTime() - new Date(a.executed_at).getTime())
    .slice(0, parseInt(limit as string, 10));

  return {
    status: 200,
    body: { logs: sorted }
  };
};

/**
 * Create a new scheduled task
 */
export const createTask: ApiRouteHandler = async (ctx) => {
  const { serverId, name, action, schedule, config } = ctx.request.body;

  if (!serverId || !name || !action || !schedule) {
    return {
      status: 400,
      body: { error: 'serverId, name, action, and schedule are required' }
    };
  }

  // Validate action type
  const validActions = ['start', 'stop', 'restart', 'command', 'execute_action'];
  if (!validActions.includes(action)) {
    return {
      status: 400,
      body: { error: `Invalid action type. Valid types: ${validActions.join(', ')}` }
    };
  }

  // Validate command is provided for command action
  if (action === 'command' && !config?.command) {
    return {
      status: 400,
      body: { error: 'config.command is required for command action' }
    };
  }

  // Validate actionId is provided for execute_action
  if (action === 'execute_action' && !config?.actionId) {
    return {
      status: 400,
      body: { error: 'config.actionId is required for execute_action' }
    };
  }

  // Validate and parse cron expression
  let interval;
  try {
    interval = CronExpressionParser.parse(schedule);
  } catch (err: any) {
    return {
      status: 400,
      body: { error: `Invalid cron expression: ${err.message}` }
    };
  }

  // Calculate next run time
  const nextRun = interval.next().toDate();

  const task: ScheduledTask = {
    serverId,
    name,
    action,
    schedule,
    config: config || {},
    enabled: true,
    next_run: nextRun,
    created_at: new Date(),
  };

  const result = await ctx.db.collection('schedules').insertOne(task);
  const savedTask = { ...task, _id: result.insertedId };

  ctx.logger.info(`Created task: ${name} for server ${serverId}. Next run: ${nextRun}`);

  return {
    status: 200,
    body: { message: 'Task created successfully', task: savedTask }
  };
};

/**
 * Update an existing scheduled task
 */
export const updateTask: ApiRouteHandler = async (ctx) => {
  const taskId = ctx.request.params?.id;
  const { serverId } = ctx.request.query;
  const updates = ctx.request.body;

  if (!serverId || !taskId) {
    return {
      status: 400,
      body: { error: 'serverId (query) and taskId (url param) are required' }
    };
  }

  // Build the update object — only allow specific fields
  const allowedFields = ['name', 'action', 'schedule', 'config', 'enabled'];
  const updateDoc: Record<string, any> = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateDoc[field] = updates[field];
    }
  }

  // If schedule changed, recalculate next_run
  if (updateDoc.schedule) {
    try {
      const interval = CronExpressionParser.parse(updateDoc.schedule);
      updateDoc.next_run = interval.next().toDate();
    } catch (err: any) {
      return {
        status: 400,
        body: { error: `Invalid cron expression: ${err.message}` }
      };
    }
  }

  if (Object.keys(updateDoc).length === 0) {
    return {
      status: 400,
      body: { error: 'No valid fields to update' }
    };
  }

  await ctx.db.collection('schedules').updateOne(
    { _id: taskId, serverId },
    { $set: updateDoc }
  );

  ctx.logger.info(`Updated task: ${taskId} for server ${serverId}`);

  return {
    status: 200,
    body: { message: 'Task updated successfully' }
  };
};

/**
 * Toggle a task's enabled state
 */
export const toggleTask: ApiRouteHandler = async (ctx) => {
  const taskId = ctx.request.params?.id;
  const { serverId } = ctx.request.query;
  const { enabled } = ctx.request.body;

  if (!serverId || !taskId || enabled === undefined) {
    return {
      status: 400,
      body: { error: 'serverId (query), taskId (url param), and enabled (body) are required' }
    };
  }

  // If re-enabling, recalculate next_run
  const updateDoc: Record<string, any> = { enabled };
  if (enabled) {
    const task = await ctx.db.collection('schedules').findOne({ _id: taskId, serverId });
    if (task?.schedule) {
      try {
        const interval = CronExpressionParser.parse(task.schedule);
        updateDoc.next_run = interval.next().toDate();
      } catch {
        // Keep existing next_run if parse fails
      }
    }
  }

  await ctx.db.collection('schedules').updateOne(
    { _id: taskId, serverId },
    { $set: updateDoc }
  );

  ctx.logger.info(`${enabled ? 'Enabled' : 'Disabled'} task: ${taskId} for server ${serverId}`);

  return {
    status: 200,
    body: { message: `Task ${enabled ? 'enabled' : 'disabled'} successfully`, enabled }
  };
};

/**
 * Delete a scheduled task
 */
export const deleteTask: ApiRouteHandler = async (ctx) => {
  const taskId = ctx.request.params?.id;
  const serverId = ctx.request.query?.serverId;

  if (!serverId || !taskId) {
    return {
      status: 400,
      body: { error: 'serverId (query) and taskId (url param) are required' }
    };
  }

  await ctx.db.collection('schedules').deleteOne({
    _id: taskId,
    serverId
  });

  ctx.logger.info(`Deleted task: ${taskId} for server ${serverId}`);

  return {
    status: 200,
    body: { message: 'Task deleted successfully', taskId }
  };
};

/**
 * Clear execution logs for a server
 */
export const clearLogs: ApiRouteHandler = async (ctx) => {
  const serverId = ctx.request.query?.serverId;

  if (!serverId) {
    return {
      status: 400,
      body: { error: 'serverId is required' }
    };
  }

  const result = await ctx.db.collection('task_logs').deleteMany({ serverId });

  ctx.logger.info(`Cleared ${result.deletedCount} logs for server ${serverId}`);

  return {
    status: 200,
    body: { message: `Cleared ${result.deletedCount} log entries` }
  };
};

/**
 * Process scheduled tasks (called by cron.tick event)
 * This is where the actual task execution happens
 */
export const processScheduledTasks: TypedEventHandler<'cron.tick'> = async (event, payload, ctx) => {
  const { task } = payload as CronTickPayload;

  if (!task || !task._id || !task.serverId) {
    ctx.logger.error('Invalid task payload: missing required fields');
    return;
  }

  // Verify the task still exists and is enabled
  const existingTask = await ctx.db.collection('schedules').findOne({ _id: task._id });
  if (!existingTask) {
    ctx.logger.warn(`Task ${task.name || task._id} no longer exists. Skipping.`);
    return;
  }

  if (existingTask.enabled === false) {
    ctx.logger.info(`Task ${task.name || task._id} is disabled. Skipping.`);
    return;
  }

  ctx.logger.info(`Processing task: ${task.name} (${task._id}) for server ${task.serverId}`);

  const startTime = Date.now();

  try {
    // Check conditions before executing
    if (task.config?.conditions) {
      const shouldSkip = await checkConditions(task, ctx);
      if (shouldSkip) {
        // Log as skipped
        await ctx.db.collection('task_logs').insertOne({
          taskId: task._id!,
          serverId: task.serverId,
          taskName: task.name,
          action: task.action,
          status: 'skipped',
          error: shouldSkip,
          executed_at: new Date(),
        } as TaskLog);

        // Still update next_run
        await updateNextRun(task, ctx);
        return;
      }
    }

    // Send pre-warning if configured
    if (task.config?.preWarning?.enabled && task.config.preWarning.message) {
      try {
        const message = task.config.preWarning.message;
        // Send warning via console command (say/broadcast)
        if (ctx.instance?.sendCommand) {
          await ctx.instance.sendCommand(message);
          ctx.logger.info(`Pre-warning sent: ${message}`);
        }
      } catch (warnErr: any) {
        ctx.logger.warn(`Pre-warning failed (non-fatal): ${warnErr.message}`);
      }
    }

    // Execute the task based on action type
    switch (task.action) {
      case 'start':
        await executeStart(task, ctx);
        break;
      case 'stop':
        await executeStop(task, ctx);
        break;
      case 'restart':
        await executeRestart(task, ctx);
        break;
      case 'command':
        await executeCommand(task, ctx);
        break;
      case 'execute_action':
        await executeServerAction(task, ctx);
        break;

      default:
        ctx.logger.error(`Unknown action type: ${task.action}`);
        return;
    }

    const duration = Date.now() - startTime;

    // Log successful execution
    await ctx.db.collection('task_logs').insertOne({
      taskId: task._id!,
      serverId: task.serverId,
      taskName: task.name,
      action: task.action,
      status: 'success',
      duration_ms: duration,
      executed_at: new Date(),
    } as TaskLog);

    // Update task with last_run and status
    await ctx.db.collection('schedules').updateOne(
      { _id: task._id },
      {
        $set: {
          last_run: new Date(),
          last_status: 'success',
          last_error: null,
        }
      }
    );

    await updateNextRun(task, ctx);

    ctx.logger.info(`Task ${task.name} completed in ${duration}ms`);

  } catch (error: any) {
    const duration = Date.now() - startTime;
    const taskIdentifier = task.name || task._id;
    ctx.logger.error(`Error executing task ${taskIdentifier}:`, error.message);

    // Check if the error is because the game server doesn't exist
    const isServerNotFound = error.message?.includes('Game server not found') ||
                             error.message?.includes('not found');

    if (isServerNotFound) {
      ctx.logger.warn(`Game server ${task.serverId} not found. Cleaning up task ${taskIdentifier}...`);
      await ctx.db.collection('schedules').deleteOne({ _id: task._id });

      await ctx.db.collection('task_logs').insertOne({
        taskId: task._id!,
        serverId: task.serverId,
        taskName: taskIdentifier,
        action: task.action,
        status: 'failed',
        error: 'Game server not found - task deleted',
        duration_ms: duration,
        executed_at: new Date(),
      } as TaskLog);
      return;
    }

    // Log failed execution
    await ctx.db.collection('task_logs').insertOne({
      taskId: task._id!,
      serverId: task.serverId,
      taskName: task.name,
      action: task.action,
      status: 'failed',
      error: error.message,
      duration_ms: duration,
      executed_at: new Date(),
    } as TaskLog);

    // Update task with error status
    await ctx.db.collection('schedules').updateOne(
      { _id: task._id },
      {
        $set: {
          last_run: new Date(),
          last_status: 'failed',
          last_error: error.message,
        }
      }
    );

    await updateNextRun(task, ctx);
  }
};

/**
 * Check task conditions. Returns a skip reason string, or null if conditions pass.
 */
async function checkConditions(task: ScheduledTask, ctx: ExtensionContext): Promise<string | null> {
  const conditions = task.config?.conditions;
  if (!conditions) return null;

  try {
    // Get server status via the internal API
    const serverInfo = await ctx.api.get(`/api/game-servers/${task.serverId}/status`);

    if (conditions.requireRunning && serverInfo?.status !== 'running') {
      return `Server is not running (status: ${serverInfo?.status})`;
    }

    const playerCount = serverInfo?.players?.current ?? 0;

    if (conditions.minPlayers !== undefined && playerCount < conditions.minPlayers) {
      return `Player count ${playerCount} is below minimum ${conditions.minPlayers}`;
    }

    if (conditions.maxPlayers !== undefined && playerCount > conditions.maxPlayers) {
      return `Player count ${playerCount} exceeds maximum ${conditions.maxPlayers}`;
    }
  } catch (err: any) {
    ctx.logger.warn(`Condition check failed (proceeding anyway): ${err.message}`);
  }

  return null;
}

/**
 * Update next_run time for a task
 */
async function updateNextRun(task: ScheduledTask, ctx: ExtensionContext): Promise<void> {
  let nextRun: Date;
  try {
    const interval = CronExpressionParser.parse(task.schedule);
    nextRun = interval.next().toDate();
  } catch (err: any) {
    ctx.logger.error(`Failed to parse cron for task ${task.name}: ${err.message}`);
    nextRun = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  await ctx.db.collection('schedules').updateOne(
    { _id: task._id },
    { $set: { next_run: nextRun } }
  );
}

// ─── Action Executors ───

async function executeStart(task: ScheduledTask, ctx: ExtensionContext): Promise<void> {
  ctx.logger.info(`Starting server ${task.serverId}...`);
  if (ctx.instance?.start) {
    await ctx.instance.start();
  } else {
    throw new Error('Instance control methods not available');
  }
}

async function executeStop(task: ScheduledTask, ctx: ExtensionContext): Promise<void> {
  ctx.logger.info(`Stopping server ${task.serverId}...`);
  if (ctx.instance?.stop) {
    await ctx.instance.stop();
  } else {
    throw new Error('Instance control methods not available');
  }
}

async function executeRestart(task: ScheduledTask, ctx: ExtensionContext): Promise<void> {
  ctx.logger.info(`Restarting server ${task.serverId}...`);
  if (ctx.instance?.restart) {
    await ctx.instance.restart();
  } else {
    throw new Error('Instance control methods not available');
  }
}

async function executeCommand(task: ScheduledTask, ctx: ExtensionContext): Promise<void> {
  const command = task.config?.command || '';
  if (!command) {
    throw new Error('No command specified in task config');
  }

  ctx.logger.info(`Sending command to server ${task.serverId}: ${command}`);
  if (ctx.instance?.sendCommand) {
    await ctx.instance.sendCommand(command);
  } else {
    throw new Error('Instance control methods not available');
  }
}

async function executeServerAction(task: ScheduledTask, ctx: ExtensionContext): Promise<void> {
  const actionId = task.config?.actionId;
  if (!actionId) {
    throw new Error('No actionId specified in task config');
  }

  ctx.logger.info(`Executing server action ${actionId} on server ${task.serverId}...`);

  // Call the Server Actions execute endpoint via internal API
  const result = await ctx.api.post(
    `/api/game-servers/${task.serverId}/actions/execute`,
    { actionId }
  );

  if (!result?.success) {
    throw new Error(result?.error || 'Server action execution failed');
  }

  ctx.logger.info(`Server action ${actionId} completed successfully`);
}



/**
 * Clean up scheduled tasks when a game server is deleted
 */
export const onServerDeleted: TypedEventHandler<'server.lifecycle.deleted'> = async (event, payload, ctx) => {
  const { serverId, serverName } = payload;
  ctx.logger.info(`Server ${serverName} (${serverId}) deleted. Cleaning up...`);

  try {
    const result = await ctx.db.collection('schedules').deleteMany({ serverId });
    ctx.logger.info(`Deleted ${result.deletedCount} scheduled task(s) for server ${serverName}`);

    if (result.deletedCount > 0) {
      await ctx.db.collection('task_logs').insertOne({
        taskId: 'cleanup',
        serverId,
        taskName: 'Server Deletion Cleanup',
        action: 'cleanup',
        status: 'success',
        error: `Cleaned up ${result.deletedCount} scheduled task(s)`,
        executed_at: new Date(),
      });
    }
  } catch (error: any) {
    ctx.logger.error(`Error cleaning up tasks for deleted server ${serverName}:`, error.message);
  }
};
