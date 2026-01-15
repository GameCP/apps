import React, { useState, useEffect } from 'react';
import { useGameCP } from '@gamecp/types/client';
import { Card, Button, FormInput, Container, Typography, SkeletonItem, SkeletonCard } from '@gamecp/ui';
import { RiSaveLine, RiStickyNoteLine } from 'react-icons/ri';
import { lang } from './lang';

interface NotesAreaProps {
    serverId: string;
}

export function NotesArea({ serverId }: NotesAreaProps) {
    const { user, api, t } = useGameCP();
    const [note, setNote] = useState<string>('');
    const [originalNote, setOriginalNote] = useState<string>(''); // Track original to detect changes
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
                setOriginalNote(data.note);
                setLastUpdated(data.updatedAt);
            } else {
                setNote('');
                setOriginalNote('');
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
            setOriginalNote(note); // Update original after save
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
            <Card padding="lg" contentClassName="space-y-4">
                <Typography as="h3" size="lg" className="font-medium">{t(lang.title)}</Typography>
                <SkeletonItem width="w-full" height="h-40" className="rounded-lg" />
                <div className="flex items-center justify-between">
                    <SkeletonItem width="w-32" height="h-4" />
                    <SkeletonItem width="w-28" height="h-10" className="rounded-lg" />
                </div>
            </Card>
        );
    }

    return (
        <Card padding="lg" contentClassName="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <RiStickyNoteLine className="w-5 h-5 text-muted-foreground" />
                    <Typography as="h3" size="lg" className="font-medium">{t(lang.title)}</Typography>
                </div>
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
                    disabled={saving || note === originalNote}
                    isLoading={saving}
                    variant="primary"
                >
                    <RiSaveLine className="h-4 w-4 mr-2" />
                    {t(lang.saveButton)}
                </Button>
            </div>
            {message && (
                <div
                    className={`p-3 rounded-lg text-sm ${message.includes('success')
                        ? 'bg-success/10 text-success border border-success/30 dark:bg-success/20 dark:text-success dark:border-success'
                        : 'bg-danger/10 text-danger border border-danger/30 dark:bg-danger/20 dark:text-danger dark:border-danger'
                        }`}
                >
                    {message}
                </div>
            )}
        </Card>
    );
}
