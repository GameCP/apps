import React, { useState, useEffect } from 'react';
import { useGameCP } from '@gamecp/types/client';
import { Card, Button, FormInput } from '@gamecp/ui';

interface NotesAreaProps {
    serverId: string;
}

export function NotesArea({ serverId }: NotesAreaProps) {
    const { user, api } = useGameCP();
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
            setMessage('Failed to load note');
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

            setMessage('Note saved successfully');
            setLastUpdated(new Date().toISOString());
            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            console.error('Failed to save note:', error);
            setMessage(error.error || 'Failed to save note');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <div className="p-4">
                    <p className="text-muted-foreground">Loading notes...</p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground">Admin Notes</h3>
                    {lastUpdated && (
                        <span className="text-xs text-muted-foreground">
                            Last updated: {new Date(lastUpdated).toLocaleString()}
                        </span>
                    )}
                </div>
                <FormInput
                    label=""
                    name="note"
                    type="textarea"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add private notes about this server (visible only to admins)..."
                    rows={6}
                    maxLength={10000}
                    footerDescription={`${note.length} / 10,000 characters`}
                />
                <div className="flex items-center justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        isLoading={saving}
                    >
                        Save Note
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
            </div>
        </Card>
    );
}
