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
  action: 'restart' | 'command' | 'wipe';
  schedule: string;
  config?: {
    command?: string;
    wipePath?: string;
  };
  enabled: boolean;
  next_run: Date;
  last_run?: Date;
  created_at: Date;
}

interface TaskLog {
  taskId: string;
  serverId: string;
  taskName: string;
  action: string;
  status: 'success' | 'failed';
  error?: string;
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

  await ctx.db.collection('schedules').insertOne(task);

  ctx.logger.info(`Created task: ${name} for server ${serverId}. Next run: ${nextRun}`);

  return {
    status: 200,
    body: { message: 'Task created successfully', task }
  };
};

/**
 * Delete a scheduled task
 */
export const deleteTask: ApiRouteHandler = async (ctx) => {
  const { serverId, taskId } = ctx.request.body;

  if (!serverId || !taskId) {
    return {
      status: 400,
      body: { error: 'serverId and taskId are required' }
    };
  }

  await ctx.db.collection('schedules').deleteOne({
    _id: taskId,
    serverId
  });

  ctx.logger.info(`Deleted task: ${taskId} for server ${serverId}`);

  return {
    status: 200,
    body: { message: 'Task deleted successfully' }
  };
};

/**
 * Process scheduled tasks (called by cron.tick event)
 * This is where the actual task execution happens
 */
export const processScheduledTasks: TypedEventHandler<'cron.tick'> = async (event, payload, ctx) => {
  const { task } = payload as CronTickPayload;

  ctx.logger.info(`Processing task: ${task.name} (${task._id}) for server ${task.serverId}`);

  try {
    // Execute the task based on action type
    switch (task.action) {
      case 'restart':
        await executeRestart(task, ctx);
        break;

      case 'command':
        await executeCommand(task, ctx);
        break;

      case 'wipe':
        await executeWipe(task, ctx);
        break;

      default:
        ctx.logger.error(`Unknown action type: ${task.action}`);
        return;
    }

    // Log successful execution
    await ctx.db.collection('task_logs').insertOne({
      taskId: task._id!,
      serverId: task.serverId,
      taskName: task.name,
      action: task.action,
      status: 'success',
      executed_at: new Date(),
    } as TaskLog);

    // Calculate next run time using cron-parser
    let nextRun: Date;
    try {
      const interval = CronExpressionParser.parse(task.schedule);
      nextRun = interval.next().toDate();
    } catch (err: any) {
      ctx.logger.error(`Failed to parse cron expression for task ${task.name}: ${err.message}`);
      // Fallback to 24 hours from now if parsing fails
      nextRun = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    await ctx.db.collection('schedules').updateOne(
      { _id: task._id },
      {
        $set: {
          next_run: nextRun,
          last_run: new Date()
        }
      }
    );

    ctx.logger.info(`Task ${task.name} executed successfully. Next run: ${nextRun}`);

  } catch (error: any) {
    ctx.logger.error(`Error executing task ${task.name}:`, error.message);

    // Log failed execution
    await ctx.db.collection('task_logs').insertOne({
      taskId: task._id!,
      serverId: task.serverId,
      taskName: task.name,
      action: task.action,
      status: 'failed',
      error: error.message,
      executed_at: new Date(),
    } as TaskLog);
  }
};

/**
 * Execute a restart action
 */
async function executeRestart(task: ScheduledTask, ctx: ExtensionContext): Promise<void> {
  ctx.logger.info(`Restarting server ${task.serverId}...`);

  if (ctx.instance?.restart) {
    await ctx.instance.restart();
  } else {
    throw new Error('Instance control methods not available');
  }
}

/**
 * Execute a command action
 */
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

/**
 * Execute a wipe action
 */
async function executeWipe(task: ScheduledTask, ctx: ExtensionContext): Promise<void> {
  const targetPath = task.config?.wipePath || 'world';

  ctx.logger.info(`Wiping ${targetPath} for server ${task.serverId}...`);

  if (ctx.instance?.deleteFile) {
    await ctx.instance.deleteFile(targetPath);

    // Restart after wipe
    if (ctx.instance.restart) {
      await ctx.instance.restart();
    }
  } else {
    throw new Error('Instance control methods not available');
  }
}
