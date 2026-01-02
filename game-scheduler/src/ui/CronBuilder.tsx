import React, { useState, useEffect } from 'react';
import { CronExpressionParser } from 'cron-parser';

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

    // Parse existing cron to set initial values
    useEffect(() => {
        if (value) {
            const parts = value.split(' ');
            if (parts.length === 5) {
                // Only update internal state if we can map it to a simple mode
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
                    setMode('advanced'); // Auto-switch to advanced for complex crons
                }
            }
            updateScheduleInfo(value);
        } else {
            // Set a default value if none provided
            const defaultCron = '0 4 * * *'; // Daily at 4 AM
            onChange(defaultCron);
            updateScheduleInfo(defaultCron);
        }
    }, []);

    // Update info whenever value changes
    useEffect(() => {
        if (value) {
            updateScheduleInfo(value);
        }
    }, [value]);

    const updateScheduleInfo = (cron: string) => {
        try {
            const interval = CronExpressionParser.parse(cron);
            const next = interval.next().toDate();

            let desc = 'Custom Schedule';
            const parts = cron.split(' ');

            if (parts.length === 5) {
                if (parts[1] === '*' && parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
                    desc = `Every hour at minute ${parts[0]}`;
                } else if (parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
                    desc = `Every day at ${parts[1].padStart(2, '0')}:${parts[0].padStart(2, '0')}`;
                } else if (parts[2] === '*' && parts[3] === '*' && parts[4] !== '*') {
                    const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const dayName = daysMap[parseInt(parts[4])] || 'Day ' + parts[4];
                    desc = `Every week on ${dayName} at ${parts[1].padStart(2, '0')}:${parts[0].padStart(2, '0')}`;
                }
            }

            setScheduleInfo({
                description: desc,
                nextRun: next.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
            });
        } catch (e) {
            setScheduleInfo({ description: 'Invalid Expression', nextRun: '-' });
        }
    };

    const buildCron = () => {
        switch (frequency) {
            case 'hourly':
                return `${minute} * * * *`;
            case 'daily':
                return `${minute} ${hour} * * *`;
            case 'weekly':
                return `${minute} ${hour} * * ${dayOfWeek}`;
            default:
                return value;
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
        // Re-construct logic to ensure we don't lose state
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
        { label: 'Every hour', value: '0 * * * *', freq: 'hourly' as const, h: '0', m: '0', d: '*' },
        { label: 'Every 6 hours', value: '0 */6 * * *', freq: 'custom' as const, h: '0', m: '0', d: '*' },
        { label: 'Daily at 4 AM', value: '0 4 * * *', freq: 'daily' as const, h: '4', m: '0', d: '*' },
        { label: 'Daily at midnight', value: '0 0 * * *', freq: 'daily' as const, h: '0', m: '0', d: '*' },
        { label: 'Weekly (Sunday 4 AM)', value: '0 4 * * 0', freq: 'weekly' as const, h: '4', m: '0', d: '0' },
        { label: 'Every Monday 9 AM', value: '0 9 * * 1', freq: 'weekly' as const, h: '9', m: '0', d: '1' },
    ];

    const handlePresetClick = (preset: typeof presets[0]) => {
        // Update internal state to match the preset
        setFrequency(preset.freq);
        setHour(preset.h);
        setMinute(preset.m);
        setDayOfWeek(preset.d);
        // Update the cron value
        onChange(preset.value);
    };

    const days = [
        { label: 'Sunday', value: '0' },
        { label: 'Monday', value: '1' },
        { label: 'Tuesday', value: '2' },
        { label: 'Wednesday', value: '3' },
        { label: 'Thursday', value: '4' },
        { label: 'Friday', value: '5' },
        { label: 'Saturday', value: '6' },
    ];

    return (
        <div className="space-y-6">
            {/* Schedule Info Banner */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-1">
                        Schedule Summary
                    </h3>
                    <p className="text-lg font-medium text-blue-700">
                        {scheduleInfo.description}
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-xs text-blue-500 uppercase font-semibold">Next Run</span>
                    <div className="text-blue-800 font-mono font-medium">
                        {scheduleInfo.nextRun}
                    </div>
                </div>
            </div>

            {/* Mode Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex gap-6">
                    <button
                        type="button"
                        onClick={() => setMode('simple')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${mode === 'simple'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Visual Builder
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('advanced')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${mode === 'advanced'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Advanced (Cron)
                    </button>
                </nav>
            </div>

            {mode === 'simple' ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Frequency Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            How often should this run?
                        </label>
                        <select
                            value={frequency}
                            onChange={(e) => handleFrequencyChange(e.target.value as any)}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-base"
                        >
                            <option value="hourly">Every Hour</option>
                            <option value="daily">Every Day</option>
                            <option value="weekly">Every Week</option>
                            <option value="custom">Custom (Switch to Advanced)</option>
                        </select>
                    </div>

                    {/* Time Picker */}
                    {(frequency !== 'custom') && (
                        <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                            {(frequency === 'daily' || frequency === 'weekly') && (
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">
                                            Hour (24h)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="23"
                                            value={hour}
                                            onChange={(e) => handleTimeChange(e.target.value, minute)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                                        />
                                        <div className="text-xs text-gray-500 mt-1">0 = Midnight, 12 = Noon, 23 = 11PM</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">
                                            Minute
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="59"
                                            value={minute}
                                            onChange={(e) => handleTimeChange(hour, e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                                        />
                                    </div>
                                </div>
                            )}

                            {frequency === 'hourly' && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Minute past the hour
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Run at :</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="59"
                                            value={minute}
                                            onChange={(e) => {
                                                setMinute(e.target.value);
                                                onChange(`${e.target.value} * * * *`);
                                            }}
                                            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-lg"
                                        />
                                        <span className="text-gray-500">of every hour</span>
                                    </div>
                                </div>
                            )}

                            {frequency === 'weekly' && (
                                <div className="pt-2 border-t border-gray-200 mt-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Day of the Week
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {days.map((day) => (
                                            <button
                                                key={day.value}
                                                type="button"
                                                onClick={() => handleDayChange(day.value)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${dayOfWeek === day.value
                                                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-200'
                                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {day.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quick Presets */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Quick Presets
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {presets.map((preset) => {
                                const isSelected = value === preset.value;
                                return (
                                    <button
                                        key={preset.value}
                                        type="button"
                                        onClick={() => handlePresetClick(preset)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${isSelected
                                                ? 'bg-blue-600 text-white ring-2 ring-blue-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                            }`}
                                    >
                                        {preset.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Raw Cron Expression
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                placeholder="0 4 * * *"
                                className="w-full px-4 py-3 font-mono text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="mt-2 text-xs text-gray-500 flex justify-between">
                                <span>Format: minute hour day(month) month day(week)</span>
                                <a href="https://crontab.guru/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Need help?</a>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Common Examples</h4>
                        <ul className="space-y-2 text-sm text-gray-600 font-mono">
                            <li className="flex justify-between"><span>0 0 * * *</span> <span className="text-gray-400">Daily at midnight</span></li>
                            <li className="flex justify-between"><span>0 */4 * * *</span> <span className="text-gray-400">Every 4 hours</span></li>
                            <li className="flex justify-between"><span>0 9 * * 1</span> <span className="text-gray-400">Every Monday at 9AM</span></li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};
