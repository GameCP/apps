import type { ApiRouteHandler } from '@gamecp/types';

interface Note {
  serverId: string;
  note: string;
  updatedAt: string;
}

/**
 * Save admin note for a server
 */
export const saveNote: ApiRouteHandler = async (ctx) => {
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

    ctx.logger.info(`Note saved for server ${serverId}`);

    return {
      status: 200,
      body: {
        success: true,
        message: 'Note saved successfully'
      }
    };
  } catch (error) {
    ctx.logger.error('Error saving note:', error);
    return {
      status: 500,
      body: { error: 'Failed to save note' }
    };
  }
};

/**
 * Get admin note for a server
 */
export const getNote: ApiRouteHandler = async (ctx) => {
  const { serverId } = ctx.request.query;

  if (!serverId) {
    return {
      status: 400,
      body: { error: 'Server ID is required' }
    };
  }

  try {
    const notes: Note[] = await ctx.db.collection('notes').find({ serverId }).toArray();

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
    ctx.logger.error('Error fetching note:', error);
    return {
      status: 500,
      body: { error: 'Failed to fetch note' }
    };
  }
};
