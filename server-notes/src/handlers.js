// Server-side handlers for admin notes
export async function saveNote(ctx) {
    const { serverId, note } = ctx.request.body;

    if (!serverId) {
        return {
            status: 400,
            body: { error: 'Server ID is required' }
        };
    }

    if (!note || typeof note !== 'string') {
        return {
            status: 400,
            body: { error: 'Note content is required' }
        };
    }

    if (note.length > 10000) {
        return {
            status: 400,
            body: { error: 'Note is too long (max 10,000 characters)' }
        };
    }

    try {
        // Check if note exists
        const existingNotes = await ctx.db.collection('notes').find({ serverId }).toArray();

        if (existingNotes.length > 0) {
            // Update existing note
            await ctx.db.collection('notes').deleteOne({ serverId });
        }

        // Insert new/updated note
        await ctx.db.collection('notes').insertOne({
            serverId,
            note,
            updatedAt: new Date().toISOString()
        });

        ctx.console.log(`Note saved for server ${serverId}`);

        return {
            status: 200,
            body: {
                success: true,
                message: 'Note saved successfully'
            }
        };
    } catch (error) {
        ctx.console.error('Error saving note:', error);
        return {
            status: 500,
            body: { error: 'Failed to save note' }
        };
    }
}

export async function getNote(ctx) {
    const { serverId } = ctx.request.query;

    if (!serverId) {
        return {
            status: 400,
            body: { error: 'Server ID is required' }
        };
    }

    try {
        const notes = await ctx.db.collection('notes').find({ serverId }).toArray();

        if (notes.length === 0) {
            return {
                status: 200,
                body: { note: '' }
            };
        }

        return {
            status: 200,
            body: {
                note: notes[0].note,
                updatedAt: notes[0].updatedAt
            }
        };
    } catch (error) {
        ctx.console.error('Error fetching note:', error);
        return {
            status: 500,
            body: { error: 'Failed to fetch note' }
        };
    }
}
