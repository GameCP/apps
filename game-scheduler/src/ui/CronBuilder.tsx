import React, { useState } from 'react';

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

    // Parse existing cron to set initial values
    React.useEffect(() => {
        if (value) {
            const parts = value.split(' ');
            if (parts.length === 5) {
                setMinute(parts[0]);
                setHour(parts[1]);
                setDayOfWeek(parts[4]);

                // Detect frequency
                if (parts[1] === '*' && parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
                    setFrequency('hourly');
                } else if (parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
                    setFrequency('daily');
                } else if (parts[2] === '*' && parts[3] === '*' && parts[4] !== '*') {
                    setFrequency('weekly');
                } else {
                    setFrequency('custom');
                    setMode('advanced');
                }
            }
        }
    }, []);

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
        }
    };

    const handleTimeChange = (newHour: string, newMinute: string) => {
        setHour(newHour);
        setMinute(newMinute);
        const cron = buildCron();
        onChange(cron);
    };

    const handleDayChange = (day: string) => {
        setDayOfWeek(day);
        onChange(`${minute} ${hour} * * ${day}`);
    };

    const presets = [
        { label: 'Every hour', value: '0 * * * *' },
        { label: 'Every 6 hours', value: '0 */6 * * *' },
        { label: 'Daily at 4 AM', value: '0 4 * * *' },
        { label: 'Daily at midnight', value: '0 0 * * *' },
        { label: 'Weekly (Sunday 4 AM)', value: '0 4 * * 0' },
        { label: 'Every Monday 9 AM', value: '0 9 * * 1' },
    ];

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
        <div className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-4">
                <button
                    type="button"
                    onClick={() => setMode('simple')}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${mode === 'simple'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Visual Builder
                </button>
                <button
                    type="button"
                    onClick={() => setMode('advanced')}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${mode === 'advanced'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Advanced (Cron)
                </button>
            </div>

            {mode === 'simple' ? (
                <div className="space-y-4">
                    {/* Quick Presets */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quick Presets
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {presets.map((preset) => (
                                <button
                                    key={preset.value}
                                    type="button"
                                    onClick={() => onChange(preset.value)}
                                    className={`px-3 py-2 text-sm rounded border transition-colors ${value === preset.value
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Frequency Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Frequency
                        </label>
                        <select
                            value={frequency}
                            onChange={(e) => handleFrequencyChange(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="hourly">Every Hour</option>
                            <option value="daily">Every Day</option>
                            <option value="weekly">Every Week</option>
                            <option value="custom">Custom (use advanced mode)</option>
                        </select>
                    </div>

                    {/* Time Picker (for daily/weekly) */}
                    {(frequency === 'daily' || frequency === 'weekly') && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hour (0-23)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={hour}
                                    onChange={(e) => handleTimeChange(e.target.value, minute)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Minute (0-59)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={minute}
                                    onChange={(e) => handleTimeChange(hour, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    {/* Minute Picker (for hourly) */}
                    {frequency === 'hourly' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minute (0-59)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={minute}
                                onChange={(e) => {
                                    setMinute(e.target.value);
                                    onChange(`${e.target.value} * * * *`);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    {/* Day Picker (for weekly) */}
                    {frequency === 'weekly' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Day of Week
                            </label>
                            <select
                                value={dayOfWeek}
                                onChange={(e) => handleDayChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {days.map((day) => (
                                    <option key={day.value} value={day.value}>
                                        {day.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Preview */}
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Cron Expression:</div>
                        <div className="font-mono text-sm">{value || buildCron()}</div>
                    </div>
                </div>
            ) : (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cron Expression
                    </label>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="0 4 * * *"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                        Examples: "0 4 * * *" (4 AM daily), "0 */6 * * *" (every 6 hours)
                    </p>
                </div>
            )}
        </div>
    );
};
