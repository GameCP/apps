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
  action: 'start' | 'stop' | 'restart' | 'command' | 'wipe';
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

  const result = await ctx.db.collection('schedules').insertOne(task);
  
  // Add the _id to the task for the return value
  const savedTask = { ...task, _id: result.insertedId };

  ctx.logger.info(`Created task: ${name} for server ${serverId}. Next run: ${nextRun}`);

  return {
    status: 200,
    body: { message: 'Task created successfully', task: savedTask }
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
 * Process scheduled tasks (called by cron.tick event)
 * This is where the actual task execution happens
 */
export const processScheduledTasks: TypedEventHandler<'cron.tick'> = async (event, payload, ctx) => {
  const { task } = payload as CronTickPayload;

  // Validate task has required fields
  if (!task || !task._id || !task.serverId) {
    ctx.logger.error('Invalid task payload: missing required fields');
    return;
  }

  // Verify the task still exists before processing
  // (it may have been deleted between scheduling and execution)
  const existingTask = await ctx.db.collection('schedules').findOne({ _id: task._id });
  if (!existingTask) {
    ctx.logger.warn(`Task ${task.name || task._id} no longer exists in the database. Skipping execution.`);
    return;
  }

  ctx.logger.info(`Processing task: ${task.name} (${task._id}) for server ${task.serverId}`);

  try {
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
    const taskIdentifier = task.name || task._id;
    ctx.logger.error(`Error executing task ${taskIdentifier}:`, error.message);

    // Check if the error is because the game server doesn't exist
    const isServerNotFound = error.message?.includes('Game server not found') || 
                             error.message?.includes('not found');
    
    if (isServerNotFound) {
      ctx.logger.warn(`Game server ${task.serverId} no longer exists. Cleaning up orphaned task ${taskIdentifier}...`);
      
      // Delete the orphaned task
      await ctx.db.collection('schedules').deleteOne({ _id: task._id });
      
      // Log the cleanup
      await ctx.db.collection('task_logs').insertOne({
        taskId: task._id!,
        serverId: task.serverId,
        taskName: taskIdentifier,
        action: task.action,
        status: 'failed',
        error: 'Game server not found - task deleted',
        executed_at: new Date(),
      } as TaskLog);
      
      ctx.logger.info(`Orphaned task ${taskIdentifier} has been automatically deleted`);
      return; // Don't re-throw, task is cleaned up
    }

    // Log failed execution for other errors
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
 * Execute a start action
 */
async function executeStart(task: ScheduledTask, ctx: ExtensionContext): Promise<void> {
  ctx.logger.info(`Starting server ${task.serverId}...`);

  if (ctx.instance?.start) {
    await ctx.instance.start();
  } else {
    throw new Error('Instance control methods not available');
  }
}

/**
 * Execute a stop action
 */
async function executeStop(task: ScheduledTask, ctx: ExtensionContext): Promise<void> {
  ctx.logger.info(`Stopping server ${task.serverId}...`);

  if (ctx.instance?.stop) {
    await ctx.instance.stop();
  } else {
    throw new Error('Instance control methods not available');
  }
}

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

/**
 * Clean up scheduled tasks when a game server is deleted
 * This is called via the server.lifecycle.deleted event
 */
export const onServerDeleted: TypedEventHandler<'server.lifecycle.deleted'> = async (event, payload, ctx) => {
  const { serverId, serverName } = payload;

  ctx.logger.info(`Server ${serverName} (${serverId}) was deleted. Cleaning up scheduled tasks...`);

  try {
    // Delete all scheduled tasks for this server
    const result = await ctx.db.collection('schedules').deleteMany({ serverId });
    
    ctx.logger.info(`Deleted ${result.deletedCount} scheduled task(s) for server ${serverName}`);

    // Log the cleanup
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
