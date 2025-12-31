import React, { useState, useEffect } from 'react';
import { TbCalendarEvent } from 'react-icons/tb';
import { schedulerContent } from './content';
import { useGameCP, gamecp } from '@gamecp/types/client';

// Client-side UI components
export function ScheduleIcon({ serverId }: { serverId: string }) {
    const { Link, t } = useGameCP();

    return (
        <Link
            href={`/game-servers/${serverId}/extensions/scheduler`}
            className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-muted hover:text-foreground transition-all duration-150 ease-in-out"
            title={t(schedulerContent.page.title)}
        >
            <TbCalendarEvent className="mr-3 h-5 w-5 transition-all duration-150 ease-in-out" />
            <span>{t(schedulerContent.nav.title)}</span>
        </Link>
    );
}

export function SchedulerPage({ serverId }: { serverId: string }) {
    const { Button, Card, Badge, t, confirm } = useGameCP();
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [taskName, setTaskName] = useState('');
    const [actionType, setActionType] = useState('restart');
    const [schedule, setSchedule] = useState('0 4 * * *'); // Default: 4 AM daily

    useEffect(() => {
        loadTasks();
    }, [serverId]);

    const loadTasks = async () => {
        try {
            const data = await gamecp.api.get(`/api/x/game-scheduler/tasks?serverId=${serverId}`);
            setTasks(data.tasks || []);
        } catch (err) {
            console.error('Failed to load tasks:', err);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError(null);

        try {
            await gamecp.api.post('/api/x/game-scheduler/tasks', {
                serverId,
                name: taskName,
                action: actionType,
                schedule,
            });

            setMessage(t(schedulerContent.messages.created));
            setTaskName('');
            loadTasks();
        } catch (err: any) {
            setError(err.message || t(schedulerContent.messages.createFailed));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        const confirmed = await confirm({
            title: t(schedulerContent.confirm.deleteTitle),
            message: t(schedulerContent.confirm.deleteMessage),
            confirmText: t(schedulerContent.buttons.delete),
            confirmButtonColor: 'red'
        });

        if (!confirmed) return;

        setLoading(true);
        setMessage('');
        setError(null);

        try {
            await gamecp.api.delete('/api/x/game-scheduler/tasks', { serverId, taskId });
            setMessage(t(schedulerContent.messages.deleted));
            loadTasks();
        } catch (err: any) {
            setError(err.message || t(schedulerContent.messages.deleteFailed));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                            {t(schedulerContent.page.title)}
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1">
                            {t(schedulerContent.page.description)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            {(error || message) && (
                <div className="mb-6">
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-destructive text-sm font-medium">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="bg-success-light/10 border border-success-light/20 rounded-md p-3 text-success-dark text-sm font-medium">
                            {message}
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-4 sm:space-y-6">
                {/* Create Task Card */}
                <Card
                    title={t(schedulerContent.createTask.title)}
                    description={t(schedulerContent.createTask.description)}
                    icon={TbCalendarEvent}
                    iconColor="blue"
                    padding="lg"
                >
                    <form onSubmit={handleCreateTask} className="space-y-6 mt-4">
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-1">
                                {t(schedulerContent.form.taskName)} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={taskName}
                                onChange={(e) => setTaskName(e.target.value)}
                                placeholder={t(schedulerContent.form.taskNamePlaceholder)}
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-1">
                                {t(schedulerContent.form.actionType)} <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={actionType}
                                onChange={(e) => setActionType(e.target.value)}
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                            >
                                <option value="restart">{t(schedulerContent.form.actionRestart)}</option>
                                <option value="command">{t(schedulerContent.form.actionCommand)}</option>
                                <option value="wipe">{t(schedulerContent.form.actionWipe)}</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-1">
                                {t(schedulerContent.form.schedule)} <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-muted-foreground mb-2">
                                {t(schedulerContent.form.scheduleHint)}
                            </p>
                            <input
                                type="text"
                                value={schedule}
                                onChange={(e) => setSchedule(e.target.value)}
                                placeholder={t(schedulerContent.form.schedulePlaceholder)}
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all font-mono"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            isLoading={loading}
                            variant="primary"
                        >
                            {t(schedulerContent.buttons.create)}
                        </Button>
                    </form>
                </Card>

                {/* Tasks List */}
                {tasks.length > 0 && (
                    <Card
                        title={t(schedulerContent.tasks.title)}
                        padding="none"
                        headerClassName="p-4 sm:px-6 border-b border-border"
                    >
                        <div className="divide-y divide-border">
                            {tasks.map((task, index) => (
                                <div key={index} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                    <div className="flex-1 min-w-0 mr-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Badge variant="success" size="sm">
                                                {t(schedulerContent.tasks.active)}
                                            </Badge>
                                            <span className="font-semibold text-foreground">
                                                {task.name}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <div>{t(schedulerContent.tasks.action)}: <span className="font-mono">{task.action}</span></div>
                                            <div>{t(schedulerContent.tasks.schedule)}: <span className="font-mono">{task.schedule}</span></div>
                                            {task.next_run && (
                                                <div>{t(schedulerContent.tasks.nextRun)}: {new Date(task.next_run).toLocaleString()}</div>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleDeleteTask(task._id)}
                                        variant="danger"
                                        size="sm"
                                        isLoading={loading}
                                    >
                                        {t(schedulerContent.buttons.delete)}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
