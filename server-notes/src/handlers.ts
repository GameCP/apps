import type { ApiRouteHandler } from '@gamecp/types';

/**
 * Save admin note for a server
 * Stores in server.extensionData['server-notes']
 */
export const saveNote: ApiRouteHandler = async (ctx) => {
  // Admin check
  if (!ctx.user || ctx.user.role !== 'admin') {
    return {
      status: 403,
      body: { error: 'Admin access required' }
    };
  }

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
    // Store note in server's extensionData
    const noteData = {
      note,
      updatedAt: new Date().toISOString()
    };

    // Use the extension data API
    const response = await ctx.api.put(`/api/game-servers/${serverId}/extension-data/server-notes`, {
      data: noteData
    });

    if (!response.success) {
      throw new Error('Failed to save note');
    }

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
 * Reads from server.extensionData['server-notes']
 */
export const getNote: ApiRouteHandler = async (ctx) => {
  // Admin check
  if (!ctx.user || ctx.user.role !== 'admin') {
    return {
      status: 403,
      body: { error: 'Admin access required' }
    };
  }

  const { serverId } = ctx.request.query;

  if (!serverId) {
    return {
      status: 400,
      body: { error: 'Server ID is required' }
    };
  }

  try {
    // Fetch note from server's extensionData
    const response = await ctx.api.get(`/api/game-servers/${serverId}/extension-data/server-notes`);
    const noteData = response.data || {};

    return {
      status: 200,
      body: {
        note: noteData.note || '',
        updatedAt: noteData.updatedAt || null
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

