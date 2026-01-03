import React, { useState, useEffect } from 'react';
import { TbCalendarEvent } from 'react-icons/tb';
import { lang } from './lang';
import { useGameCP } from '@gamecp/types/client';
import { Card, Button, Badge, FormInput, useConfirmDialog, Container, Typography } from '@gamecp/ui';
import { CronBuilder } from './ui/CronBuilder';

// Client-side UI components
export function ScheduleIcon({ serverId }: { serverId: string }) {
    const { Link, t } = useGameCP();

    return (
        <Link
            href={`/ game - servers / ${serverId} /extensions/scheduler`}
            className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-muted hover:text-foreground transition-all duration-150 ease-in-out"
            title={t(lang.page.title)}
        >
            <TbCalendarEvent className="mr-3 h-5 w-5 transition-all duration-150 ease-in-out" />
            <span>{t(lang.nav.title)}</span>
        </Link>
    );
}

export function SchedulerPage({ serverId }: { serverId: string }) {
    const { api, t } = useGameCP();
    const { confirm, dialog } = useConfirmDialog();
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
            const data = await api.get(`/ api / x / game - scheduler / tasks ? serverId = ${serverId} `);
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
            await api.post('/api/x/game-scheduler/tasks', {
                serverId,
                name: taskName,
                action: actionType,
                schedule,
            });

            setMessage(t(lang.messages.created));
            setTaskName('');
            loadTasks();
        } catch (err: any) {
            setError(err.message || t(lang.messages.createFailed));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        const confirmed = await confirm({
            title: t(lang.confirm.deleteTitle),
            message: t(lang.confirm.deleteMessage),
            confirmText: t(lang.buttons.delete),
            confirmButtonColor: 'red'
        });

        if (!confirmed) return;

        setLoading(true);
        setMessage('');
        setError(null);

        try {
            await api.delete('/api/x/game-scheduler/tasks', { serverId, taskId });
            setMessage(t(lang.messages.deleted));
            loadTasks();
        } catch (err: any) {
            setError(err.message || t(lang.messages.deleteFailed));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <Typography as="h1" size="xl" className="sm:text-2xl font-bold">
                            {t(lang.page.title)}
                        </Typography>
                        <Typography variant="muted" size="sm" className="sm:text-base mt-1">
                            {t(lang.page.description)}
                        </Typography>
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
                    title={t(lang.createTask.title)}
                    description={t(lang.createTask.description)}
                    icon={TbCalendarEvent}
                    iconColor="blue"
                    padding="lg"
                >
                    <form onSubmit={handleCreateTask} className="space-y-6 mt-4">
                        <FormInput
                            label={t(lang.form.taskName)}
                            name="taskName"
                            type="text"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            placeholder={t(lang.form.taskNamePlaceholder)}
                            required
                        />

                        <FormInput
                            label={t(lang.form.actionType)}
                            name="actionType"
                            type="select"
                            value={actionType}
                            onChange={(e) => setActionType(e.target.value)}
                            options={[
                                { value: 'start', label: t(lang.form.actionStart) },
                                { value: 'stop', label: t(lang.form.actionStop) },
                                { value: 'restart', label: t(lang.form.actionRestart) },
                            ]}
                            required
                        />

                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-3">
                                {t(lang.form.schedule)} <span className="text-red-500">*</span>
                            </label>
                            <CronBuilder
                                value={schedule}
                                onChange={setSchedule}
                                t={t}
                            />
                        </div>

                        <Button
                            type="submit"
                            isLoading={loading}
                            variant="primary"
                        >
                            {t(lang.buttons.create)}
                        </Button>
                    </form>
                </Card>

                {/* Tasks List */}
                {tasks.length > 0 && (
                    <Card
                        title={t(lang.tasks.title)}
                        padding="none"
                        headerClassName="p-4 sm:px-6 border-b border-border"
                    >
                        <div className="divide-y divide-border">
                            {tasks.map((task, index) => (
                                <div key={index} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                    <div className="flex-1 min-w-0 mr-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Badge variant="success" size="sm">
                                                {t(lang.tasks.active)}
                                            </Badge>
                                            <span className="font-semibold text-foreground">
                                                {task.name}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <div>{t(lang.tasks.action)}: <span className="font-mono">{task.action}</span></div>
                                            <div>{t(lang.tasks.schedule)}: <span className="font-mono">{task.schedule}</span></div>
                                            {task.next_run && (
                                                <div>{t(lang.tasks.nextRun)}: {new Date(task.next_run).toLocaleString()}</div>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleDeleteTask(task._id)}
                                        variant="danger"
                                        size="sm"
                                        isLoading={loading}
                                    >
                                        {t(lang.buttons.delete)}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
            {dialog}
        </Container>
    );
}
