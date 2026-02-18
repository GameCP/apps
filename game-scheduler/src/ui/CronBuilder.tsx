import React, { useState, useEffect, useCallback } from 'react';
import { CronExpressionParser } from 'cron-parser';
import { RiAddLine, RiSubtractLine } from 'react-icons/ri';
import { lang } from '../lang';
import { Button, FormInput, Typography } from '@gamecp/ui';

interface CronBuilderProps {
    value: string;
    onChange: (cron: string) => void;
    t: (content: Record<string, string>) => string;
}

const tzShort = new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop() || '';

// ─── Stepper Input ───

function StepperInput({
    label,
    value,
    onChange,
    min,
    max,
    hint,
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    min: number;
    max: number;
    hint?: string;
}) {
    const num = parseInt(value, 10) || 0;

    const increment = () => {
        const next = num >= max ? min : num + 1;
        onChange(String(next));
    };
    const decrement = () => {
        const next = num <= min ? max : num - 1;
        onChange(String(next));
    };

    return (
        <div>
            {label && <label className="block text-sm font-semibold text-foreground mb-1.5">{label}</label>}
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    className="w-8 h-8 rounded-md bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    onClick={decrement}
                >
                    <RiSubtractLine className="w-4 h-4" />
                </button>
                <input
                    type="number"
                    className="w-16 text-center bg-secondary border border-border rounded-md py-1.5 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={value}
                    min={min}
                    max={max}
                    onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v) && v >= min && v <= max) {
                            onChange(String(v));
                        } else if (e.target.value === '') {
                            onChange(String(min));
                        }
                    }}
                />
                <button
                    type="button"
                    className="w-8 h-8 rounded-md bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    onClick={increment}
                >
                    <RiAddLine className="w-4 h-4" />
                </button>
            </div>
            {hint && <span className="text-[11px] text-muted-foreground mt-1 block">{hint}</span>}
        </div>
    );
}

// ─── Cron Builder ───

export const CronBuilder: React.FC<CronBuilderProps> = ({ value, onChange, t }) => {
    const [mode, setMode] = useState<'quick' | 'visual' | 'advanced'>('quick');
    const [frequency, setFrequency] = useState<'hourly' | 'daily' | 'weekly' | 'custom'>('daily');
    const [hour, setHour] = useState('4');
    const [minute, setMinute] = useState('0');
    const [dayOfWeek, setDayOfWeek] = useState('*');
    const [scheduleInfo, setScheduleInfo] = useState({ description: '', nextRun: '' });

    const cb = lang.cronBuilder;

    useEffect(() => {
        if (value) {
            const parts = value.split(' ');
            if (parts.length === 5) {
                if (parts[1] === '*' && parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
                    setFrequency('hourly');
                    setMinute(parts[0]);
                } else if (parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
                    setFrequency('daily');
                    setMinute(parts[0]);
                    setHour(parts[1]);
                } else if (parts[2] === '*' && parts[3] === '*' && parts[4] !== '*') {
                    setFrequency('weekly');
                    setMinute(parts[0]);
                    setHour(parts[1]);
                    setDayOfWeek(parts[4]);
                } else {
                    setFrequency('custom');
                }
            }
            updateScheduleInfo(value);
        } else {
            const defaultCron = '0 4 * * *';
            onChange(defaultCron);
            updateScheduleInfo(defaultCron);
        }
    }, []);

    useEffect(() => {
        if (value) {
            updateScheduleInfo(value);
        }
    }, [value]);

    const updateScheduleInfo = useCallback((cron: string) => {
        try {
            const interval = CronExpressionParser.parse(cron);
            const next = interval.next().toDate();

            let desc = t(cb.customSchedule);
            const parts = cron.split(' ');

            if (parts.length === 5) {
                if (parts[1] === '*' && parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
                    desc = `${t(cb.everyHour)} at :${parts[0].padStart(2, '0')}`;
                } else if (parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
                    desc = `${t(cb.everyDay)} at ${parts[1].padStart(2, '0')}:${parts[0].padStart(2, '0')}`;
                } else if (parts[2] === '*' && parts[3] === '*' && parts[4] !== '*') {
                    const daysMap = [t(cb.days.sunday), t(cb.days.monday), t(cb.days.tuesday), t(cb.days.wednesday), t(cb.days.thursday), t(cb.days.friday), t(cb.days.saturday)];
                    const dayName = daysMap[parseInt(parts[4])] || parts[4];
                    desc = `${t(cb.everyWeek)} on ${dayName} at ${parts[1].padStart(2, '0')}:${parts[0].padStart(2, '0')}`;
                } else if (parts[1].startsWith('*/')) {
                    desc = `Every ${parts[1].replace('*/', '')} hours at :${parts[0].padStart(2, '0')}`;
                }
            }

            setScheduleInfo({
                description: desc,
                nextRun: next.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
            });
        } catch (e) {
            setScheduleInfo({ description: t(cb.invalidExpression), nextRun: '-' });
        }
    }, [t]);

    const handleFrequencyChange = (newFreq: typeof frequency) => {
        setFrequency(newFreq);
        if (newFreq !== 'custom') {
            const cron = newFreq === 'hourly' ? `${minute} * * * *` :
                newFreq === 'daily' ? `${minute} ${hour} * * *` :
                    `${minute} ${hour} * * ${dayOfWeek}`;
            onChange(cron);
        } else {
            setMode('advanced');
        }
    };

    const handleTimeChange = (newHour: string, newMinute: string) => {
        setHour(newHour);
        setMinute(newMinute);
        const cron = frequency === 'hourly' ? `${newMinute} * * * *` :
            frequency === 'daily' ? `${newMinute} ${newHour} * * *` :
                frequency === 'weekly' ? `${newMinute} ${newHour} * * ${dayOfWeek}` : value;
        onChange(cron);
    };

    const handleDayChange = (day: string) => {
        setDayOfWeek(day);
        const cron = `${minute} ${hour} * * ${day}`;
        onChange(cron);
    };

    const presets = [
        { label: t(cb.presets.everyHour), value: '0 * * * *', freq: 'hourly' as const, h: '0', m: '0', d: '*' },
        { label: t(cb.presets.every6Hours), value: '0 */6 * * *', freq: 'custom' as const, h: '0', m: '0', d: '*' },
        { label: t(cb.presets.dailyAt4AM), value: '0 4 * * *', freq: 'daily' as const, h: '4', m: '0', d: '*' },
        { label: t(cb.presets.dailyAtMidnight), value: '0 0 * * *', freq: 'daily' as const, h: '0', m: '0', d: '*' },
        { label: t(cb.presets.weeklySunday4AM), value: '0 4 * * 0', freq: 'weekly' as const, h: '4', m: '0', d: '0' },
        { label: t(cb.presets.everyMonday9AM), value: '0 9 * * 1', freq: 'weekly' as const, h: '9', m: '0', d: '1' },
    ];

    const handlePresetClick = (preset: typeof presets[0]) => {
        setFrequency(preset.freq);
        setHour(preset.h);
        setMinute(preset.m);
        setDayOfWeek(preset.d);
        onChange(preset.value);
    };

    const days = [
        { label: t(cb.days.sunday), value: '0' },
        { label: t(cb.days.monday), value: '1' },
        { label: t(cb.days.tuesday), value: '2' },
        { label: t(cb.days.wednesday), value: '3' },
        { label: t(cb.days.thursday), value: '4' },
        { label: t(cb.days.friday), value: '5' },
        { label: t(cb.days.saturday), value: '6' },
    ];

    const tabClass = (tab: string) =>
        `px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mode === tab
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-muted-foreground hover:text-foreground'
        }`;

    return (
        <div className="space-y-4">
            {/* Schedule Summary */}
            <div className="rounded-lg border border-primary/20 bg-background overflow-hidden">
                <div className="border-l-[3px] border-primary px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">
                            {t(cb.scheduleSummary)}
                        </div>
                        <div className="text-sm font-medium text-foreground">
                            {scheduleInfo.description}
                        </div>
                    </div>
                    <div className="sm:text-right">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">
                            {t(cb.nextRun)}
                        </div>
                        <div className="text-sm font-mono font-medium text-foreground">
                            {scheduleInfo.nextRun}
                            {scheduleInfo.nextRun !== '-' && (
                                <span className="text-muted-foreground/60 text-[10px] ml-1">({tzShort})</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3 Mode Tabs */}
            <div className="flex gap-1.5">
                <button type="button" className={tabClass('quick')} onClick={() => setMode('quick')}>
                    {t(cb.quickPresets)}
                </button>
                <button type="button" className={tabClass('visual')} onClick={() => setMode('visual')}>
                    {t(cb.visualBuilder)}
                </button>
                <button type="button" className={tabClass('advanced')} onClick={() => setMode('advanced')}>
                    {t(cb.advancedCron)}
                </button>
            </div>

            {/* ─── Quick Tab: Presets ─── */}
            {mode === 'quick' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {presets.map((preset) => (
                        <button
                            type="button"
                            key={preset.value}
                            className={`px-4 py-3 text-sm font-medium rounded-lg border text-left transition-all ${value === preset.value
                                    ? 'bg-primary/10 border-primary/40 text-primary ring-1 ring-primary/20'
                                    : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'
                                }`}
                            onClick={() => handlePresetClick(preset)}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            )}

            {/* ─── Visual Tab: Frequency + Time ─── */}
            {mode === 'visual' && (
                <div className="space-y-4">
                    <FormInput
                        label={t(cb.howOften)}
                        name="frequency"
                        type="select"
                        value={frequency}
                        onChange={(e) => handleFrequencyChange(e.target.value as any)}
                        options={[
                            { value: 'hourly', label: t(cb.everyHour) },
                            { value: 'daily', label: t(cb.everyDay) },
                            { value: 'weekly', label: t(cb.everyWeek) },
                            { value: 'custom', label: t(cb.customAdvanced) },
                        ]}
                    />

                    {frequency !== 'custom' && (
                        <div className="rounded-lg border border-border bg-background p-4 space-y-4">
                            {(frequency === 'daily' || frequency === 'weekly') && (
                                <div className="grid grid-cols-2 gap-6">
                                    <StepperInput
                                        label={t(cb.hour24)}
                                        value={hour}
                                        onChange={(h) => handleTimeChange(h, minute)}
                                        min={0}
                                        max={23}
                                        hint={t(cb.hourHint)}
                                    />
                                    <StepperInput
                                        label={t(cb.minute)}
                                        value={minute}
                                        onChange={(m) => handleTimeChange(hour, m)}
                                        min={0}
                                        max={59}
                                    />
                                </div>
                            )}

                            {frequency === 'hourly' && (
                                <div className="flex items-center gap-3">
                                    <Typography variant="muted">{t(cb.runAt)}</Typography>
                                    <StepperInput
                                        label=""
                                        value={minute}
                                        onChange={(m) => {
                                            setMinute(m);
                                            onChange(`${m} * * * *`);
                                        }}
                                        min={0}
                                        max={59}
                                    />
                                    <Typography variant="muted">{t(cb.ofEveryHour)}</Typography>
                                </div>
                            )}

                            {frequency === 'weekly' && (
                                <div className="pt-3 mt-3 border-t border-border">
                                    <Typography size="sm" className="font-bold mb-2">
                                        {t(cb.dayOfWeek)}
                                    </Typography>
                                    <div className="flex flex-wrap gap-2">
                                        {days.map((day) => (
                                            <Button
                                                type="button"
                                                key={day.value}
                                                variant={dayOfWeek === day.value ? 'primary' : 'secondary'}
                                                size="sm"
                                                onClick={() => handleDayChange(day.value)}
                                            >
                                                {day.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ─── Advanced Tab: Raw Cron ─── */}
            {mode === 'advanced' && (
                <div className="space-y-4">
                    <FormInput
                        label={t(cb.rawCron)}
                        name="cron"
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="0 4 * * *"
                        description={
                            <span className="flex justify-between">
                                <span>{t(cb.cronFormat)}</span>
                                <a href="https://crontab.guru/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{t(cb.needHelp)}</a>
                            </span>
                        }
                    />

                    <div className="rounded-lg border border-border bg-background p-4">
                        <Typography size="xs" className="font-bold uppercase mb-3">{t(cb.commonExamples)}</Typography>
                        <div className="space-y-2 text-sm font-mono">
                            {[
                                { cron: '0 0 * * *', label: t(cb.dailyMidnight) },
                                { cron: '0 */4 * * *', label: t(cb.every4Hours) },
                                { cron: '0 9 * * 1', label: t(cb.everyMonday9AM) },
                            ].map((ex) => (
                                <button
                                    type="button"
                                    key={ex.cron}
                                    className={`w-full flex justify-between items-center px-2 py-1 rounded transition-colors ${value === ex.cron
                                            ? 'bg-primary/10 text-primary'
                                            : 'hover:bg-muted/50'
                                        }`}
                                    onClick={() => onChange(ex.cron)}
                                >
                                    <span>{ex.cron}</span>
                                    <span className="text-muted-foreground text-xs font-sans">{ex.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
