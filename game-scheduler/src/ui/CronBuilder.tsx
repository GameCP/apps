import React, { useState, useEffect } from 'react';
import { CronExpressionParser } from 'cron-parser';
import { lang } from '../lang';
import { Card, Button, FormInput, Typography } from '@gamecp/ui';

interface CronBuilderProps {
    value: string;
    onChange: (cron: string) => void;
    t: (content: Record<string, string>) => string;
}

export const CronBuilder: React.FC<CronBuilderProps> = ({ value, onChange, t }) => {
    const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
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
                    setMode('advanced');
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

    const updateScheduleInfo = (cron: string) => {
        try {
            const interval = CronExpressionParser.parse(cron);
            const next = interval.next().toDate();

            let desc = t(cb.customSchedule);
            const parts = cron.split(' ');

            if (parts.length === 5) {
                if (parts[1] === '*' && parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
                    desc = `${t(cb.everyHour)} at minute ${parts[0]}`;
                } else if (parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
                    desc = `${t(cb.everyDay)} at ${parts[1].padStart(2, '0')}:${parts[0].padStart(2, '0')}`;
                } else if (parts[2] === '*' && parts[3] === '*' && parts[4] !== '*') {
                    const daysMap = [t(cb.days.sunday), t(cb.days.monday), t(cb.days.tuesday), t(cb.days.wednesday), t(cb.days.thursday), t(cb.days.friday), t(cb.days.saturday)];
                    const dayName = daysMap[parseInt(parts[4])] || parts[4];
                    desc = `${t(cb.everyWeek)} on ${dayName} at ${parts[1].padStart(2, '0')}:${parts[0].padStart(2, '0')}`;
                }
            }

            setScheduleInfo({
                description: desc,
                nextRun: next.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
            });
        } catch (e) {
            setScheduleInfo({ description: t(cb.invalidExpression), nextRun: '-' });
        }
    };

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

    return (
        <div className="space-y-6">
            {/* Schedule Info Banner */}
            <Card className="bg-primary/5 border-primary/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4">
                    <div>
                        <Typography variant="muted" size="sm" className="uppercase tracking-wide font-semibold mb-1">
                            {t(cb.scheduleSummary)}
                        </Typography>
                        <Typography size="lg" className="font-medium">
                            {scheduleInfo.description}
                        </Typography>
                    </div>
                    <div className="text-right">
                        <Typography variant="muted" size="xs" className="uppercase font-semibold">{t(cb.nextRun)}</Typography>
                        <Typography className="font-mono font-medium">
                            {scheduleInfo.nextRun}
                        </Typography>
                    </div>
                </div>
            </Card>

            {/* Mode Tabs */}
            <div className="flex gap-2">
                <Button
                    variant={mode === 'simple' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setMode('simple')}
                >
                    {t(cb.visualBuilder)}
                </Button>
                <Button
                    variant={mode === 'advanced' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setMode('advanced')}
                >
                    {t(cb.advancedCron)}
                </Button>
            </div>

            {mode === 'simple' ? (
                <div className="space-y-6">
                    {/* Frequency Selector */}
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

                    {/* Time Picker */}
                    {(frequency !== 'custom') && (
                        <Card padding="lg" className="bg-muted/30">
                            {(frequency === 'daily' || frequency === 'weekly') && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <FormInput
                                        label={t(cb.hour24)}
                                        name="hour"
                                        type="number"
                                        value={hour}
                                        onChange={(e) => handleTimeChange(e.target.value, minute)}
                                        footerDescription={t(cb.hourHint)}
                                    />
                                    <FormInput
                                        label={t(cb.minute)}
                                        name="minute"
                                        type="number"
                                        value={minute}
                                        onChange={(e) => handleTimeChange(hour, e.target.value)}
                                    />
                                </div>
                            )}

                            {frequency === 'hourly' && (
                                <div className="flex items-center gap-3">
                                    <Typography variant="muted">{t(cb.runAt)}</Typography>
                                    <FormInput
                                        name="minute"
                                        type="number"
                                        value={minute}
                                        onChange={(e) => {
                                            setMinute(e.target.value);
                                            onChange(`${e.target.value} * * * *`);
                                        }}
                                        className="w-24"
                                    />
                                    <Typography variant="muted">{t(cb.ofEveryHour)}</Typography>
                                </div>
                            )}

                            {frequency === 'weekly' && (
                                <div className="pt-4 mt-4 border-t border-border">
                                    <Typography size="sm" className="font-bold mb-3">
                                        {t(cb.dayOfWeek)}
                                    </Typography>
                                    <div className="flex flex-wrap gap-2">
                                        {days.map((day) => (
                                            <Button
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
                        </Card>
                    )}

                    {/* Quick Presets */}
                    <div>
                        <Typography variant="muted" size="xs" className="uppercase tracking-wider font-semibold mb-2">
                            {t(cb.quickPresets)}
                        </Typography>
                        <div className="flex flex-wrap gap-2">
                            {presets.map((preset) => (
                                <Button
                                    key={preset.value}
                                    variant={value === preset.value ? 'primary' : 'secondary'}
                                    size="sm"
                                    onClick={() => handlePresetClick(preset)}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
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

                    <Card padding="lg" className="bg-muted/30">
                        <Typography size="xs" className="font-bold uppercase mb-2">{t(cb.commonExamples)}</Typography>
                        <div className="space-y-2 text-sm font-mono">
                            <div className="flex justify-between">
                                <span>0 0 * * *</span>
                                <Typography variant="muted" size="sm">{t(cb.dailyMidnight)}</Typography>
                            </div>
                            <div className="flex justify-between">
                                <span>0 */4 * * *</span>
                                <Typography variant="muted" size="sm">{t(cb.every4Hours)}</Typography>
                            </div>
                            <div className="flex justify-between">
                                <span>0 9 * * 1</span>
                                <Typography variant="muted" size="sm">{t(cb.everyMonday9AM)}</Typography>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
