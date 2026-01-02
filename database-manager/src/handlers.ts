import type { ExtensionContext, ApiResponse, MySQLConfig, PostgreSQLConfig } from '@gamecp/types';
import type { Database, DatabaseSource, CreateDatabaseRequest, DatabaseType } from './types';

// Helper to generate random password
function generatePassword(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Helper to generate database name
function generateDatabaseName(serverId: string, type: DatabaseType): string {
    const prefix = type === 'redis' ? 'redis' : 'db';
    const suffix = serverId.substring(0, 8);
    return `${prefix}_${suffix}_${Date.now()}`;
}

// Helper to build connection string
function buildConnectionString(
    type: DatabaseType,
    host: string,
    port: number,
    database: string,
    username: string,
    password: string
): string {
    switch (type) {
        case 'mysql':
            return `mysql://${username}:${password}@${host}:${port}/${database}`;
        case 'postgresql':
            return `postgresql://${username}:${password}@${host}:${port}/${database}`;
        case 'redis':
            return `redis://:${password}@${host}:${port}`;
        case 'mongodb':
            return `mongodb://${username}:${password}@${host}:${port}/${database}`;
        default:
            return '';
    }
}

// Get all databases for a server
export async function getDatabases(ctx: ExtensionContext): Promise<ApiResponse> {
    const { serverId } = ctx.request.query;
    
    if (!serverId) {
        return { status: 400, body: { error: 'Server ID required' } };
    }

    const databases = await ctx.db.collection('databases').find({ serverId }).toArray();
    return { status: 200, body: { databases } };
}

// Create a new database
export async function createDatabase(ctx: ExtensionContext): Promise<ApiResponse> {
    const { serverId, sourceId, name, type } = ctx.request.body as CreateDatabaseRequest & { type?: string };

    if (!serverId) {
        return { status: 400, body: { error: 'Server ID required' } };
    }

    // If sourceId not provided, auto-select based on type
    let selectedSourceId = sourceId;
    if (!selectedSourceId) {
        const dbType = type || 'mysql';
        const sources = await ctx.db.collection('database_sources')
            .find({ type: dbType, enabled: true })
            .toArray() as DatabaseSource[];
        
        if (sources.length === 0) {
            return { status: 404, body: { error: `No enabled ${dbType} database sources available` } };
        }
        
        // Pick the first available source
        selectedSourceId = sources[0]._id;
        ctx.logger.info(`Auto-selected database source: ${sources[0].name}`, { type: dbType });
    }

    // Get the database source
    const source = await ctx.db.collection('database_sources').findOne({ _id: selectedSourceId }) as DatabaseSource | null;

    if (!source || !source.enabled) {
        return { status: 404, body: { error: 'Database source not found or disabled' } };
    }

    // Generate database name and credentials
    const databaseName = name || generateDatabaseName(serverId, source.type);
    const username = `user_${databaseName.substring(0, 20)}`;
    const password = generatePassword();

    try {
        // Provision the database based on type
        if (source.type === 'mysql' && ctx.mysql) {
            const config: MySQLConfig = {
                host: source.host,
                port: source.port,
                user: source.adminUsername,
                password: source.adminPassword,
            };
            
            // Create database
            await ctx.mysql.query(config, `CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
            
            // Create user with password
            await ctx.mysql.query(config, `CREATE USER IF NOT EXISTS '${username}'@'%' IDENTIFIED BY '${password}'`);
            
            // Grant privileges
            await ctx.mysql.query(config, `GRANT ALL PRIVILEGES ON \`${databaseName}\`.* TO '${username}'@'%'`);
            await ctx.mysql.query(config, 'FLUSH PRIVILEGES');
            
        } else if (source.type === 'postgresql' && ctx.pg) {
            const config: PostgreSQLConfig = {
                host: source.host,
                port: source.port,
                user: source.adminUsername,
                password: source.adminPassword,
                database: 'postgres',
            };
            
            // Create user
            await ctx.pg.query(config, `CREATE USER "${username}" WITH PASSWORD '${password}'`);
            
            // Create database owned by user
            await ctx.pg.query(config, `CREATE DATABASE "${databaseName}" OWNER "${username}"`);
            
        } else if (source.type === 'redis' && ctx.redis) {
            // Redis doesn't have traditional databases/users
            // Just store the connection info
        }
    } catch (err: any) {
        ctx.logger.error('Failed to provision database', { error: err.message });
        return { status: 500, body: { error: `Failed to provision database: ${err.message}` } };
    }

    // Store the database record
    const database: Omit<Database, '_id'> = {
        serverId,
        sourceId,
        type: source.type,
        name: databaseName,
        host: source.host,
        port: source.port,
        username,
        password,
        connectionString: buildConnectionString(source.type, source.host, source.port, databaseName, username, password),
        status: 'active',
        createdAt: new Date(),
    };

    const result = await ctx.db.collection('databases').insertOne(database);

    return {
        status: 201,
        body: {
            database: { ...database, _id: result.insertedId },
            message: 'Database created successfully',
        },
    };
}

// Delete a database
export async function deleteDatabase(ctx: ExtensionContext): Promise<ApiResponse> {
    const { id } = ctx.request.params;

    if (!id) {
        return { status: 400, body: { error: 'Database ID required' } };
    }

    const database = await ctx.db.collection('databases').findOne({ _id: id }) as Database | null;

    if (!database) {
        return { status: 404, body: { error: 'Database not found' } };
    }

    // Get the source to drop the database
    const source = await ctx.db.collection('database_sources').findOne({ _id: database.sourceId }) as DatabaseSource | null;

    if (source) {
        try {
            if (source.type === 'mysql' && ctx.mysql) {
                const config: MySQLConfig = {
                    host: source.host,
                    port: source.port,
                    user: source.adminUsername,
                    password: source.adminPassword,
                };
                await ctx.mysql.query(config, `DROP DATABASE IF EXISTS \`${database.name}\``);
                await ctx.mysql.query(config, `DROP USER IF EXISTS '${database.username}'@'%'`);
                
            } else if (source.type === 'postgresql' && ctx.pg) {
                const config: PostgreSQLConfig = {
                    host: source.host,
                    port: source.port,
                    user: source.adminUsername,
                    password: source.adminPassword,
                    database: 'postgres',
                };
                await ctx.pg.query(config, `DROP DATABASE IF EXISTS "${database.name}"`);
                await ctx.pg.query(config, `DROP USER IF EXISTS "${database.username}"`);
            }
        } catch (err: any) {
            ctx.logger.warn('Failed to drop database from server', { error: err.message });
        }
    }

    await ctx.db.collection('databases').deleteOne({ _id: id });

    return { status: 200, body: { message: 'Database deleted' } };
}

// Suspend a database (disable access)
export async function suspendDatabase(ctx: ExtensionContext): Promise<ApiResponse> {
    const { id } = ctx.request.params;

    if (!id) {
        return { status: 400, body: { error: 'Database ID required' } };
    }

    const result = await ctx.db.collection('databases').updateOne(
        { _id: id },
        { $set: { status: 'suspended' } }
    );

    if (result.matchedCount === 0) {
        return { status: 404, body: { error: 'Database not found' } };
    }

    ctx.logger.info('Database suspended', { id });
    return { status: 200, body: { message: 'Database suspended' } };
}

// Unsuspend a database (enable access)
export async function unsuspendDatabase(ctx: ExtensionContext): Promise<ApiResponse> {
    const { id } = ctx.request.params;

    if (!id) {
        return { status: 400, body: { error: 'Database ID required' } };
    }

    const result = await ctx.db.collection('databases').updateOne(
        { _id: id },
        { $set: { status: 'active' } }
    );

    if (result.matchedCount === 0) {
        return { status: 404, body: { error: 'Database not found' } };
    }

    ctx.logger.info('Database unsuspended', { id });
    return { status: 200, body: { message: 'Database unsuspended' } };
}

// Suspend all databases for a server
export async function suspendServerDatabases(ctx: ExtensionContext): Promise<ApiResponse> {
    const { serverId } = ctx.request.body;

    if (!serverId) {
        return { status: 400, body: { error: 'Server ID required' } };
    }

    const result = await ctx.db.collection('databases').updateMany(
        { serverId },
        { $set: { status: 'suspended' } }
    );

    ctx.logger.info('Server databases suspended', { serverId, count: result.modifiedCount });
    return { status: 200, body: { message: `${result.modifiedCount} database(s) suspended` } };
}

// Unsuspend all databases for a server
export async function unsuspendServerDatabases(ctx: ExtensionContext): Promise<ApiResponse> {
    const { serverId } = ctx.request.body;

    if (!serverId) {
        return { status: 400, body: { error: 'Server ID required' } };
    }

    const result = await ctx.db.collection('databases').updateMany(
        { serverId },
        { $set: { status: 'active' } }
    );

    ctx.logger.info('Server databases unsuspended', { serverId, count: result.modifiedCount });
    return { status: 200, body: { message: `${result.modifiedCount} database(s) unsuspended` } };
}


// Get all database sources (admin only)
export async function getSources(ctx: ExtensionContext): Promise<ApiResponse> {
    // Admin check
    if (!ctx.user || ctx.user.role !== 'admin') {
        return { status: 403, body: { error: 'Admin access required' } };
    }
    
    const sources = await ctx.db.collection('database_sources').find({}).toArray();
    
    // Mask passwords for security
    const sanitizedSources = sources.map((source: any) => ({
        ...source,
        adminPassword: '********',
    }));

    return { status: 200, body: { sources: sanitizedSources } };
}

// Create a database source (admin only)
export async function createSource(ctx: ExtensionContext): Promise<ApiResponse> {
    // Admin check
    if (!ctx.user || ctx.user.role !== 'admin') {
        return { status: 403, body: { error: 'Admin access required' } };
    }
    
    const { type, name, host, port, adminUsername, adminPassword, adminerUrl } = ctx.request.body;

    if (!type || !name || !host || !port || !adminUsername || !adminPassword || !adminerUrl) {
        return { status: 400, body: { error: 'All fields required' } };
    }

    const source: Omit<DatabaseSource, '_id'> = {
        type,
        name,
        host,
        port,
        adminUsername,
        adminPassword,
        adminerUrl,
        enabled: true,
        createdAt: new Date(),
    };

    const result = await ctx.db.collection('database_sources').insertOne(source);

    return {
        status: 201,
        body: {
            source: { ...source, _id: result.insertedId, adminPassword: '********' },
        },
    };
}

// Update a database source (admin only)
export async function updateSource(ctx: ExtensionContext): Promise<ApiResponse> {
    // Admin check
    if (!ctx.user || ctx.user.role !== 'admin') {
        return { status: 403, body: { error: 'Admin access required' } };
    }
    
    const { id } = ctx.request.params;
    const updates = ctx.request.body;

    if (!id) {
        return { status: 400, body: { error: 'Source ID required' } };
    }

    const result = await ctx.db.collection('database_sources').updateOne(
        { _id: id },
        { $set: updates }
    );

    if (result.matchedCount === 0) {
        return { status: 404, body: { error: 'Source not found' } };
    }

    return { status: 200, body: { message: 'Source updated' } };
}

// Delete a database source (admin only)
export async function deleteSource(ctx: ExtensionContext): Promise<ApiResponse> {
    // Admin check
    if (!ctx.user || ctx.user.role !== 'admin') {
        return { status: 403, body: { error: 'Admin access required' } };
    }
    
    const { id } = ctx.request.params;

    if (!id) {
        return { status: 400, body: { error: 'Source ID required' } };
    }

    const result = await ctx.db.collection('database_sources').deleteOne({ _id: id });

    if (result.deletedCount === 0) {
        return { status: 404, body: { error: 'Source not found' } };
    }

    return { status: 200, body: { message: 'Source deleted' } };
}
