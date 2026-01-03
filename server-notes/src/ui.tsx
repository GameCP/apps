import React, { useState, useEffect } from 'react';
import { useGameCP } from '@gamecp/types/client';
import { Card, Button, FormInput, Container, Typography } from '@gamecp/ui';
import { lang } from './lang';

interface NotesAreaProps {
    serverId: string;
}

export function NotesArea({ serverId }: NotesAreaProps) {
    const { user, api, t } = useGameCP();
    const [note, setNote] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    // Only show to admins
    if (!user || user.role !== 'admin') {
        return null;
    }

    useEffect(() => {
        loadNote();
    }, [serverId]);

    const loadNote = async () => {
        setLoading(true);
        try {
            const data = await api.get(`/api/x/server-notes/notes?serverId=${serverId}`);

            if (data.note) {
                setNote(data.note);
                setLastUpdated(data.updatedAt);
            }
        } catch (error) {
            console.error('Failed to load note:', error);
            setMessage(t(lang.messages.loadError));
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');

        try {
            await api.post('/api/x/server-notes/notes', {
                serverId,
                note
            });

            setMessage(t(lang.messages.saveSuccess));
            setLastUpdated(new Date().toISOString());
            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            console.error('Failed to save note:', error);
            setMessage(error.error || t(lang.messages.saveError));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Card padding="lg">
                <Typography variant="muted">{t(lang.loading)}</Typography>
            </Card>
        );
    }

    return (
        <Card padding="lg" contentClassName="space-y-4">
            <div className="flex items-center justify-between">
                <Typography as="h3" size="lg" className="font-bold">{t(lang.title)}</Typography>
                {lastUpdated && (
                    <Typography size="xs" variant="muted">
                        {t(lang.lastUpdated)} {new Date(lastUpdated).toLocaleString()}
                    </Typography>
                )}
            </div>
            <FormInput
                label=""
                name="note"
                type="textarea"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t(lang.placeholder)}
                rows={6}
                maxLength={10000}
                footerDescription={`${note.length} / 10,000 ${t(lang.characters)}`}
            />
            <div className="flex items-center justify-end">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    isLoading={saving}
                    variant="primary"
                >
                    {t(lang.saveButton)}
                </Button>
            </div>
            {message && (
                <div
                    className={`p-3 rounded-lg text-sm ${message.includes('success')
                        ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                        : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                        }`}
                >
                    {message}
                </div>
            )}
        </Card>
    );
}
