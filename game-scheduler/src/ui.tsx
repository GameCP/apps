import React, { useState, useMemo } from 'react';
import {
    RiCalendarEventLine,
    RiPlayLine,
    RiStopLine,
    RiRestartLine,
    RiTerminalLine,
    RiFlashlightLine,
    RiDeleteBinLine,
    RiCheckLine,
    RiCloseLine,
    RiTimeLine,
    RiHistoryLine,
    RiAlertLine,
    RiEditLine,
    RiAddLine,
    RiErrorWarningLine,
} from 'react-icons/ri';
import { lang } from './lang';
import { useGameCP } from '@gamecp/types/client';
import {
    Card,
    Button,
    Badge,
    FormInput,
    useConfirmDialog,
    Container,
    PageHeader,
    SkeletonItem,
    SidebarNavItem,
    EmptyState,
    Switch,
} from '@gamecp/ui';
import { CronBuilder } from './ui/CronBuilder';
import useSWR, { mutate } from 'swr';

// ─── Helpers ───

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const tzShort = new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop() || tz;

function formatDate(d: string | Date) {
    return new Date(d).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

// ─── Sidebar Nav Icon ───

export function ScheduleIcon({ serverId }: { serverId: string }) {
    const { t } = useGameCP();
    const href = `/game-servers/${serverId}/extensions/scheduler`;

    return (
        <SidebarNavItem
            href={href}
            icon={RiCalendarEventLine}
            title={t(lang.page.title)}
        >
            {t(lang.nav.title)}
        </SidebarNavItem>
    );
}

// ─── Main Page ───

export function SchedulerPage({ serverId }: { serverId: string }) {
    const { api, t } = useGameCP();
    const { confirm, dialog } = useConfirmDialog();
    const [activeTab, setActiveTab] = useState<'tasks' | 'history'>('tasks');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingTask, setEditingTask] = useState<any>(null);

    // SWR
    const tasksKey = `/api/x/game-scheduler/tasks?serverId=${serverId}`;
    const logsKey = `/api/x/game-scheduler/logs?serverId=${serverId}&limit=100`;
    const { data: tasksData, isLoading: tasksLoading } = useSWR(tasksKey, () => api.get(tasksKey));
    const { data: logsData, isLoading: logsLoading } = useSWR(
        activeTab === 'history' ? logsKey : null,
        () => api.get(logsKey)
    );

    const tasks = tasksData?.tasks || [];
    const logs = logsData?.logs || [];

    // Loading skeleton
    if (tasksLoading) {
        return (
            <Container padding="lg" className="space-y-6">
                <PageHeader title={t(lang.page.title)} subtitle={t(lang.page.description)} size="md" />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <SkeletonItem width="w-16" height="h-5" rounded />
                                <SkeletonItem width="w-32" height="h-5" />
                            </div>
                            <SkeletonItem width="w-48" height="h-3" />
                        </div>
                    ))}
                </div>
            </Container>
        );
    }

    const handleToggle = async (taskId: string, enabled: boolean) => {
        try {
            await api.fetch(`/api/x/game-scheduler/tasks/${taskId}?serverId=${serverId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled }),
            });
            mutate(tasksKey);
        } catch (err: any) {
            console.error('Toggle failed:', err);
        }
    };

    const handleDelete = async (taskId: string) => {
        const confirmed = await confirm({
            title: t(lang.confirm.deleteTitle),
            message: t(lang.confirm.deleteMessage),
            confirmText: t(lang.buttons.delete),
            confirmButtonColor: 'danger'
        });
        if (!confirmed) return;

        try {
            await api.delete(`/api/x/game-scheduler/tasks/${taskId}?serverId=${serverId}`);
            mutate(tasksKey);
        } catch (err: any) {
            console.error('Delete failed:', err);
        }
    };

    const handleClearLogs = async () => {
        const confirmed = await confirm({
            title: t(lang.history.clearTitle),
            message: t(lang.history.clearMessage),
            confirmText: t(lang.history.clearConfirm),
            confirmButtonColor: 'danger'
        });
        if (!confirmed) return;

        try {
            await api.delete(`/api/x/game-scheduler/logs?serverId=${serverId}`);
            mutate(logsKey);
        } catch (err: any) {
            console.error('Clear logs failed:', err);
        }
    };

    const tabClass = (tab: string) =>
        `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`;

    return (
        <Container padding="lg" className="space-y-6">
            <PageHeader
                title={t(lang.page.title)}
                subtitle={t(lang.page.description)}
                size="md"
                rightContent={
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => { setEditingTask(null); setShowCreateForm(true); setActiveTab('tasks'); }}
                    >
                        <RiAddLine className="w-4 h-4 mr-1.5" />
                        {t(lang.buttons.create)}
                    </Button>
                }
            />

            {/* Tabs */}
            <div className="flex gap-2">
                <button className={tabClass('tasks')} onClick={() => setActiveTab('tasks')}>
                    <span className="flex items-center gap-1.5">
                        <RiCalendarEventLine className="w-4 h-4" />
                        {t(lang.tabs.tasks)}
                        {tasks.length > 0 && (
                            <Badge variant="gray" size="sm">{tasks.length}</Badge>
                        )}
                    </span>
                </button>
                <button className={tabClass('history')} onClick={() => setActiveTab('history')}>
                    <span className="flex items-center gap-1.5">
                        <RiHistoryLine className="w-4 h-4" />
                        {t(lang.tabs.history)}
                    </span>
                </button>
            </div>

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
                <div className="space-y-3">
                    {showCreateForm && (
                        <TaskForm
                            serverId={serverId}
                            task={editingTask}
                            api={api}
                            t={t}
                            onClose={() => { setShowCreateForm(false); setEditingTask(null); }}
                            onSaved={() => {
                                setShowCreateForm(false);
                                setEditingTask(null);
                                mutate(tasksKey);
                            }}
                        />
                    )}

                    {tasks.length === 0 && !showCreateForm ? (
                        <EmptyState
                            icon={RiCalendarEventLine}
                            title={t(lang.empty.title)}
                            subtitle={t(lang.empty.description)}
                            action={
                                <Button variant="primary" size="sm" onClick={() => setShowCreateForm(true)}>
                                    {t(lang.buttons.create)}
                                </Button>
                            }
                        />
                    ) : (
                        tasks.map((task: any) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                t={t}
                                onToggle={handleToggle}
                                onEdit={(t: any) => { setEditingTask(t); setShowCreateForm(true); }}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <HistoryTab
                    logs={logs}
                    isLoading={logsLoading}
                    t={t}
                    onClear={handleClearLogs}
                />
            )}

            {dialog}
        </Container>
    );
}

// ─── Task Card ───

const ACTION_ICONS: Record<string, any> = {
    start: RiPlayLine,
    stop: RiStopLine,
    restart: RiRestartLine,
    command: RiTerminalLine,
    execute_action: RiFlashlightLine,

};

const ACTION_COLORS: Record<string, string> = {
    start: 'success',
    stop: 'error',
    restart: 'amber',
    command: 'info',
    execute_action: 'purple',

};

function TaskCard({
    task,
    t,
    onToggle,
    onEdit,
    onDelete,
}: {
    task: any;
    t: (content: any) => string;
    onToggle: (id: string, enabled: boolean) => void;
    onEdit: (task: any) => void;
    onDelete: (id: string) => void;
}) {
    const Icon = ACTION_ICONS[task.action] || RiCalendarEventLine;
    const color = ACTION_COLORS[task.action] || 'gray';

    return (
        <div className={`card p-4 transition-opacity ${!task.enabled ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg bg-${color}/10 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 text-${color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground truncate">{task.name}</span>
                        {task.last_status === 'failed' && (
                            <Badge variant="error" size="sm">
                                <RiAlertLine className="w-3 h-3 mr-1" />
                                {t(lang.tasks.failed)}
                            </Badge>
                        )}
                    </div>

                    <div className="text-xs text-muted-foreground space-y-0.5">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span>{t(lang.tasks.action)}: <span className="font-mono text-foreground">{task.action}</span></span>
                            <span>{t(lang.tasks.schedule)}: <span className="font-mono text-foreground">{task.schedule}</span></span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            {task.next_run && task.enabled && (
                                <span className="flex items-center gap-1">
                                    <RiTimeLine className="w-3 h-3" />
                                    {t(lang.tasks.nextRun)}: {formatDate(task.next_run)}
                                    <span className="text-muted-foreground/60 text-[10px]">({tzShort})</span>
                                </span>
                            )}
                            {task.last_run && (
                                <span>
                                    {t(lang.tasks.lastRun)}: {formatDate(task.last_run)}
                                </span>
                            )}
                        </div>
                        {task.last_error && (
                            <div className="text-danger text-xs mt-1 truncate">
                                {task.last_error}
                            </div>
                        )}
                        {task.config?.command && (
                            <div className="mt-1">
                                <span className="font-mono text-foreground bg-muted/50 px-1.5 py-0.5 rounded text-xs">
                                    {task.config.command}
                                </span>
                            </div>
                        )}
                        {task.config?.preWarning?.enabled && (
                            <div className="mt-1 text-amber flex items-center gap-1">
                                <RiAlertLine className="w-3 h-3" />
                                <span>{task.config.preWarning.minutes}m before: <em>{task.config.preWarning.message}</em></span>
                            </div>
                        )}
                        {task.config?.conditions && (
                            <div className="mt-1 flex items-center gap-2 flex-wrap text-[10px] uppercase tracking-wide font-semibold text-muted-foreground/70">
                                {task.config.conditions.requireRunning && <span className="bg-muted/50 px-1.5 py-0.5 rounded">Running required</span>}
                                {task.config.conditions.minPlayers !== undefined && <span className="bg-muted/50 px-1.5 py-0.5 rounded">Min {task.config.conditions.minPlayers} players</span>}
                                {task.config.conditions.maxPlayers !== undefined && <span className="bg-muted/50 px-1.5 py-0.5 rounded">Max {task.config.conditions.maxPlayers} players</span>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Switch
                        checked={task.enabled}
                        onChange={() => onToggle(task._id, !task.enabled)}
                        size="sm"
                    />
                    <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
                        <RiEditLine className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(task._id)}>
                        <RiDeleteBinLine className="w-4 h-4 text-danger" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── Task Form ───

/** Detect potentially aggressive schedules */
function getScheduleWarning(schedule: string, action: string, conditions: any, t: (c: any) => string): string | null {
    const parts = schedule.split(' ');
    if (parts.length !== 5) return null;

    // Hourly or more frequent
    const isHourlyOrFaster = parts[1] === '*' || parts[1].startsWith('*/');
    const isDestructive = ['restart', 'stop'].includes(action);
    const hasNoConditions = !conditions?.requireRunning && !conditions?.minPlayers && !conditions?.maxPlayers;

    if (isHourlyOrFaster && isDestructive && hasNoConditions) {
        return t(lang.form.aggressiveWarning);
    }
    return null;
}

function TaskForm({
    serverId,
    task,
    api,
    t,
    onClose,
    onSaved,
}: {
    serverId: string;
    task: any;
    api: any;
    t: (content: any) => string;
    onClose: () => void;
    onSaved: () => void;
}) {
    const isEditing = !!task;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [taskName, setTaskName] = useState(task?.name || '');
    const [actionType, setActionType] = useState(task?.action || 'restart');
    const [schedule, setSchedule] = useState(task?.schedule || '0 4 * * *');
    const [command, setCommand] = useState(task?.config?.command || '');
    const [actionId, setActionId] = useState(task?.config?.actionId || '');

    // Pre-warning
    const [preWarningEnabled, setPreWarningEnabled] = useState(task?.config?.preWarning?.enabled || false);
    const [preWarningMinutes, setPreWarningMinutes] = useState(String(task?.config?.preWarning?.minutes || 5));
    const [preWarningMessage, setPreWarningMessage] = useState(task?.config?.preWarning?.message || 'Server restarting in 5 minutes!');

    // Conditions
    const [conditionsEnabled, setConditionsEnabled] = useState(
        !!(task?.config?.conditions?.requireRunning || task?.config?.conditions?.minPlayers !== undefined || task?.config?.conditions?.maxPlayers !== undefined)
    );
    const [requireRunning, setRequireRunning] = useState(task?.config?.conditions?.requireRunning || false);
    const [minPlayers, setMinPlayers] = useState(task?.config?.conditions?.minPlayers ?? '');
    const [maxPlayers, setMaxPlayers] = useState(task?.config?.conditions?.maxPlayers ?? '');

    // Safety warning
    const scheduleWarning = useMemo(() => {
        const conditions = conditionsEnabled ? { requireRunning, minPlayers: minPlayers || undefined, maxPlayers: maxPlayers || undefined } : {};
        return getScheduleWarning(schedule, actionType, conditions, t);
    }, [schedule, actionType, conditionsEnabled, requireRunning, minPlayers, maxPlayers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const config: any = {};

        if (actionType === 'command') {
            config.command = command;
        }
        if (actionType === 'execute_action') {
            config.actionId = actionId;
        }

        // Pre-warning
        if (preWarningEnabled) {
            config.preWarning = {
                enabled: true,
                minutes: parseInt(preWarningMinutes, 10) || 5,
                message: preWarningMessage,
            };
        }

        // Conditions
        if (conditionsEnabled) {
            const conditions: any = {};
            if (requireRunning) conditions.requireRunning = true;
            if (minPlayers !== '' && minPlayers !== undefined) conditions.minPlayers = parseInt(String(minPlayers), 10);
            if (maxPlayers !== '' && maxPlayers !== undefined) conditions.maxPlayers = parseInt(String(maxPlayers), 10);
            if (Object.keys(conditions).length > 0) config.conditions = conditions;
        }

        try {
            if (isEditing) {
                await api.put(`/api/x/game-scheduler/tasks/${task._id}?serverId=${serverId}`, {
                    name: taskName,
                    action: actionType,
                    schedule,
                    config,
                });
            } else {
                await api.post('/api/x/game-scheduler/tasks', {
                    serverId,
                    name: taskName,
                    action: actionType,
                    schedule,
                    config,
                });
            }
            onSaved();
        } catch (err: any) {
            setError(err.message || 'Failed to save task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card
            title={isEditing ? t(lang.form.editTitle) : t(lang.createTask.title)}
            description={isEditing ? t(lang.form.editDescription) : t(lang.createTask.description)}
            icon={RiCalendarEventLine}
            iconColor="info"
            padding="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                {error && (
                    <div className="bg-danger/10 border border-danger/20 rounded-md p-3 text-danger text-sm">
                        {error}
                    </div>
                )}

                {/* Row 1: Name + Action */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            { value: 'command', label: t(lang.form.actionCommand) },
                            { value: 'execute_action', label: t(lang.form.actionExecuteAction) },

                        ]}
                        required
                    />
                </div>

                {/* Dynamic fields based on action type */}
                {actionType === 'command' && (
                    <FormInput
                        label={t(lang.form.command)}
                        name="command"
                        type="text"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        placeholder={t(lang.form.commandPlaceholder)}
                        description={t(lang.form.commandDescription)}
                        required
                    />
                )}

                {actionType === 'execute_action' && (
                    <FormInput
                        label={t(lang.form.actionIdLabel)}
                        name="actionId"
                        type="text"
                        value={actionId}
                        onChange={(e) => setActionId(e.target.value)}
                        placeholder={t(lang.form.actionIdPlaceholder)}
                        description={t(lang.form.actionIdDescription)}
                        required
                    />
                )}

                {/* Schedule */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">
                        {t(lang.form.schedule)} <span className="text-danger">*</span>
                    </label>
                    <CronBuilder value={schedule} onChange={setSchedule} t={t} />
                </div>

                {/* Safety warning */}
                {scheduleWarning && (
                    <div className="flex items-start gap-2 bg-amber/5 border border-amber/20 rounded-lg p-3">
                        <RiErrorWarningLine className="w-4 h-4 text-amber flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-amber">{scheduleWarning}</span>
                    </div>
                )}

                {/* ── Pre-Warning (Progressive Disclosure) ── */}
                <div className="border border-border rounded-lg overflow-hidden bg-background">
                    <button
                        type="button"
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                        onClick={() => setPreWarningEnabled(!preWarningEnabled)}
                    >
                        <div className="flex items-center gap-3">
                            <RiAlertLine className={`w-5 h-5 ${preWarningEnabled ? 'text-amber' : 'text-muted-foreground'}`} />
                            <div className="text-left">
                                <div className="text-sm font-semibold text-foreground">{t(lang.form.preWarningLabel)}</div>
                                <div className="text-xs text-muted-foreground">
                                    {preWarningEnabled
                                        ? `${preWarningMinutes}m before: "${preWarningMessage}"`
                                        : t(lang.form.preWarningDescription)
                                    }
                                </div>
                            </div>
                        </div>
                        <Switch
                            checked={preWarningEnabled}
                            onChange={setPreWarningEnabled}
                            size="sm"
                        />
                    </button>

                    {preWarningEnabled && (
                        <div className="p-4 pt-0 border-t border-border bg-background">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                <FormInput
                                    label={t(lang.form.preWarningMinutes)}
                                    name="preWarningMinutes"
                                    type="number"
                                    value={preWarningMinutes}
                                    onChange={(e) => setPreWarningMinutes(e.target.value)}
                                />
                                <FormInput
                                    label={t(lang.form.preWarningMessage)}
                                    name="preWarningMessage"
                                    type="text"
                                    value={preWarningMessage}
                                    onChange={(e) => setPreWarningMessage(e.target.value)}
                                    placeholder="say Server restarting soon!"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Conditions (Progressive Disclosure) ── */}
                <div className="border border-border rounded-lg overflow-hidden bg-background">
                    <button
                        type="button"
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                        onClick={() => setConditionsEnabled(!conditionsEnabled)}
                    >
                        <div className="flex items-center gap-3">
                            <RiCheckLine className={`w-5 h-5 ${conditionsEnabled ? 'text-success' : 'text-muted-foreground'}`} />
                            <div className="text-left">
                                <div className="text-sm font-semibold text-foreground">{t(lang.form.conditionsLabel)}</div>
                                <div className="text-xs text-muted-foreground">
                                    {conditionsEnabled
                                        ? buildConditionsSummary(requireRunning, minPlayers, maxPlayers, t)
                                        : t(lang.form.conditionsDescription)
                                    }
                                </div>
                            </div>
                        </div>
                        <Switch
                            checked={conditionsEnabled}
                            onChange={setConditionsEnabled}
                            size="sm"
                        />
                    </button>

                    {conditionsEnabled && (
                        <div className="p-4 pt-0 border-t border-border bg-background">
                            <div className="space-y-4 pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-foreground">{t(lang.form.requireRunning)}</span>
                                    <Switch checked={requireRunning} onChange={setRequireRunning} size="sm" />
                                </div>

                                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-opacity ${!requireRunning ? 'opacity-40 pointer-events-none' : ''}`}>
                                    <FormInput
                                        label={t(lang.form.minPlayers)}
                                        name="minPlayers"
                                        type="number"
                                        value={minPlayers}
                                        onChange={(e) => setMinPlayers(e.target.value)}
                                        placeholder={t(lang.form.noLimit)}
                                    />
                                    <FormInput
                                        label={t(lang.form.maxPlayers)}
                                        name="maxPlayers"
                                        type="number"
                                        value={maxPlayers}
                                        onChange={(e) => setMaxPlayers(e.target.value)}
                                        placeholder={t(lang.form.noLimit)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit */}
                <div className="flex items-center gap-3">
                    <Button type="submit" isLoading={loading} variant="primary">
                        {isEditing ? t(lang.buttons.save) : t(lang.buttons.create)}
                    </Button>
                    <Button type="button" variant="secondary" onClick={onClose}>
                        {t(lang.buttons.cancel)}
                    </Button>
                </div>
            </form>
        </Card>
    );
}

function buildConditionsSummary(requireRunning: boolean, minPlayers: any, maxPlayers: any, t: (c: any) => string): string {
    const parts: string[] = [];
    if (requireRunning) parts.push(t(lang.form.requireRunning));
    if (minPlayers !== '' && minPlayers !== undefined) parts.push(`Min ${minPlayers} players`);
    if (maxPlayers !== '' && maxPlayers !== undefined) parts.push(`Max ${maxPlayers} players`);
    return parts.length > 0 ? parts.join(' · ') : t(lang.form.conditionsDescription);
}

// ─── History Tab ───

const STATUS_ICONS: Record<string, any> = {
    success: RiCheckLine,
    failed: RiCloseLine,
    skipped: RiAlertLine,
};

function HistoryTab({
    logs,
    isLoading,
    t,
    onClear,
}: {
    logs: any[];
    isLoading: boolean;
    t: (content: any) => string;
    onClear: () => void;
}) {
    if (isLoading) {
        return (
            <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="card p-3">
                        <div className="flex items-center gap-3">
                            <SkeletonItem width="w-6" height="h-6" rounded />
                            <SkeletonItem width="w-32" height="h-4" />
                            <SkeletonItem width="w-20" height="h-4" className="ml-auto" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <EmptyState
                icon={RiHistoryLine}
                title={t(lang.history.emptyTitle)}
                subtitle={t(lang.history.emptyDescription)}
            />
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                    {logs.length} {t(lang.history.entries)}
                </span>
                <Button variant="ghost" size="sm" onClick={onClear}>
                    <RiDeleteBinLine className="w-4 h-4 mr-1.5 text-danger" />
                    {t(lang.history.clear)}
                </Button>
            </div>

            <div className="space-y-1">
                {logs.map((log: any, i: number) => {
                    const StatusIcon = STATUS_ICONS[log.status] || RiCheckLine;
                    const isSuccess = log.status === 'success';
                    const isFailed = log.status === 'failed';
                    const iconColor = isFailed ? 'text-danger' : isSuccess ? 'text-success' : 'text-amber';
                    const bgColor = isFailed ? 'bg-danger/10' : isSuccess ? 'bg-success/10' : 'bg-amber/10';
                    const badgeVariant = isFailed ? 'error' : isSuccess ? 'success' : 'warning';

                    return (
                        <div key={i} className="card px-4 py-3 flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
                                <StatusIcon className={`w-3.5 h-3.5 ${iconColor}`} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground truncate">
                                        {log.taskName}
                                    </span>
                                    <Badge variant={badgeVariant} size="sm">{log.action}</Badge>
                                </div>
                                {log.error && (
                                    <div className="text-xs text-danger truncate mt-0.5">{log.error}</div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0 text-xs text-muted-foreground">
                                {log.duration_ms !== undefined && (
                                    <span className="font-mono">{log.duration_ms}ms</span>
                                )}
                                <span>
                                    {formatDate(log.executed_at)}
                                    <span className="text-muted-foreground/60 text-[10px] ml-1">({tzShort})</span>
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
