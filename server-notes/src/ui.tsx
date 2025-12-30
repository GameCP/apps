import React, { useState, useEffect } from 'react';
import type { GameCPWindow } from '@gamecp/types';

// Extend global window with GameCP SDK
declare global {
    interface Window extends GameCPWindow { }
}

interface NotesAreaProps {
    serverId: string;
}

export function NotesArea({ serverId }: NotesAreaProps) {
    const [note, setNote] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    useEffect(() => {
        loadNote();
    }, [serverId]);

    const loadNote = async () => {
        setLoading(true);
        try {
            const response = await window.GameCP_API.fetch(`/api/x/server-notes/notes?serverId=${serverId}`);
            const data = await response.json();

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
            const response = await window.GameCP_API.fetch('/api/x/server-notes/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    serverId,
                    note
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Note saved successfully');
                setLastUpdated(new Date().toISOString());
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(data.error || 'Failed to save note');
            }
        } catch (error) {
            console.error('Failed to save note:', error);
            setMessage('Failed to save note');
        } finally {
            setSaving(false);
        }
    };

    const { Card, Button } = window.GameCP_SDK;

    if (loading) {
        return (
            <Card>
                <div className="p-4">
                    <p className="text-gray-500">Loading notes...</p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">📝 Admin Notes</h3>
                    {lastUpdated && (
                        <span className="text-xs text-gray-500">
                            Last updated: {new Date(lastUpdated).toLocaleString()}
                        </span>
                    )}
                </div>
                <textarea
                    value={note}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
                    placeholder="Add private notes about this server (visible only to admins)..."
                    className="w-full min-h-[150px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                    maxLength={10000}
                />
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                        {note.length} / 10,000 characters
                    </span>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2"
                    >
                        {saving ? 'Saving...' : 'Save Note'}
                    </Button>
                </div>
                {message && (
                    <div
                        className={`p-3 rounded-lg text-sm ${message.includes('success')
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                            }`}
                    >
                        {message}
                    </div>
                )}
            </div>
        </Card>
    );
}
