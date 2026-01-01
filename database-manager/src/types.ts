export type DatabaseType = 'mysql' | 'postgresql' | 'redis' | 'mongodb';

export interface DatabaseSource {
    _id: string;
    type: DatabaseType;
    name: string;
    host: string;
    port: number;
    adminUsername: string;
    adminPassword: string;
    adminerUrl: string; // URL to Adminer instance (e.g., https://adminer.example.com)
    enabled: boolean;
    createdAt: Date;
}

export interface Database {
    _id: string;
    serverId: string;
    sourceId: string;
    type: DatabaseType;
    name: string;
    username: string;
    password: string;
    host: string;
    port: number;
    connectionString: string;
    status: 'pending' | 'active' | 'error';
    createdAt: Date;
}

export interface CreateDatabaseRequest {
    serverId: string;
    sourceId: string;
    name?: string; // Optional, auto-generated if not provided
}
