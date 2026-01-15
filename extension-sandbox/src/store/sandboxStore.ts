'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Extension {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  icon?: string;
  enabled: boolean;
  config: Record<string, unknown>;
  manifest: ExtensionManifest;
  uiBundle?: string;
  handlersBundle?: string;
  installedAt: string;
}

export interface ExtensionManifest {
  extension_id: string;
  version: string;
  name: string;
  description: string;
  author: string;
  ui_bundle?: string;
  handlers_bundle?: string;
  ui_injection?: UIInjection[];
  internal_logic?: {
    api_routes?: APIRoute[];
    hooks?: Hook[];
  };
  sandbox_config?: {
    permissions?: string[];
    db_collections?: string[];
    node_modules?: string[];
  };
  metadata?: {
    icon?: string;
    screenshots?: string[];
    category?: string;
    tags?: string[];
  };
}

export interface UIInjection {
  method: 'MOUNT' | 'HANDLER' | 'AUGMENT';
  target: string;
  component: string;
  route_path?: string;
  order?: number;
  position?: string;
}

export interface APIRoute {
  path: string;
  method: string;
  handler: string;
  handler_export: string;
  description?: string;
}

export interface Hook {
  event: string;
  handler: string;
  handler_export: string;
}

export interface MockGameServer {
  id: string;
  name: string;
  game: string;
  status: 'online' | 'offline' | 'starting' | 'stopping';
  ip: string;
  port: number;
  players: number;
  maxPlayers: number;
  createdAt: string;
}

export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: 'admin' | 'manager' | 'user' | 'demo';
  avatar?: string;
}

export interface ConsoleLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: string;
  message: string;
  data?: unknown;
}

export interface SandboxState {
  // Extensions
  extensions: Extension[];
  addExtension: (manifest: ExtensionManifest, bundles?: { ui?: string; handlers?: string }) => void;
  removeExtension: (id: string) => void;
  toggleExtension: (id: string) => void;
  updateExtensionConfig: (id: string, config: Record<string, unknown>) => void;
  
  // Mock data
  mockServers: MockGameServer[];
  addMockServer: (server: Omit<MockGameServer, 'id' | 'createdAt'>) => void;
  removeMockServer: (id: string) => void;
  updateMockServer: (id: string, updates: Partial<MockGameServer>) => void;
  
  // User
  currentUser: MockUser;
  setCurrentUser: (user: MockUser) => void;
  
  // Console
  consoleLogs: ConsoleLog[];
  addConsoleLog: (log: Omit<ConsoleLog, 'id' | 'timestamp'>) => void;
  clearConsoleLogs: () => void;
  
  // UI State
  selectedExtension: string | null;
  setSelectedExtension: (id: string | null) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  activeTab: 'extensions' | 'servers' | 'console' | 'docs';
  setActiveTab: (tab: 'extensions' | 'servers' | 'console' | 'docs') => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const defaultUser: MockUser = {
  id: 'user_1',
  email: 'admin@gamecp.dev',
  firstName: 'Admin',
  lastName: 'User',
  fullName: 'Admin User',
  role: 'admin',
};

const defaultServers: MockGameServer[] = [
  {
    id: 'server_1',
    name: 'Minecraft Survival',
    game: 'Minecraft',
    status: 'online',
    ip: '192.168.1.100',
    port: 25565,
    players: 12,
    maxPlayers: 50,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'server_2',
    name: 'CS2 Competitive',
    game: 'Counter-Strike 2',
    status: 'online',
    ip: '192.168.1.101',
    port: 27015,
    players: 8,
    maxPlayers: 10,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'server_3',
    name: 'Rust Vanilla',
    game: 'Rust',
    status: 'offline',
    ip: '192.168.1.102',
    port: 28015,
    players: 0,
    maxPlayers: 100,
    createdAt: new Date().toISOString(),
  },
];

export const useSandboxStore = create<SandboxState>()(
  persist(
    (set, get) => ({
      // Extensions
      extensions: [],
      addExtension: (manifest, bundles) => {
        const extension: Extension = {
          id: manifest.extension_id,
          name: manifest.name,
          version: manifest.version,
          description: manifest.description,
          author: manifest.author,
          icon: manifest.metadata?.icon,
          enabled: true,
          config: {},
          manifest,
          uiBundle: bundles?.ui,
          handlersBundle: bundles?.handlers,
          installedAt: new Date().toISOString(),
        };
        set((state) => ({
          extensions: [...state.extensions.filter(e => e.id !== extension.id), extension],
        }));
        get().addConsoleLog({
          level: 'info',
          source: 'sandbox',
          message: `Extension "${manifest.name}" installed successfully`,
        });
      },
      removeExtension: (id) => {
        const ext = get().extensions.find(e => e.id === id);
        set((state) => ({
          extensions: state.extensions.filter(e => e.id !== id),
          selectedExtension: state.selectedExtension === id ? null : state.selectedExtension,
        }));
        if (ext) {
          get().addConsoleLog({
            level: 'info',
            source: 'sandbox',
            message: `Extension "${ext.name}" removed`,
          });
        }
      },
      toggleExtension: (id) => {
        set((state) => ({
          extensions: state.extensions.map(e =>
            e.id === id ? { ...e, enabled: !e.enabled } : e
          ),
        }));
        const ext = get().extensions.find(e => e.id === id);
        if (ext) {
          get().addConsoleLog({
            level: 'info',
            source: 'sandbox',
            message: `Extension "${ext.name}" ${ext.enabled ? 'disabled' : 'enabled'}`,
          });
        }
      },
      updateExtensionConfig: (id, config) => {
        set((state) => ({
          extensions: state.extensions.map(e =>
            e.id === id ? { ...e, config: { ...e.config, ...config } } : e
          ),
        }));
      },

      // Mock servers
      mockServers: defaultServers,
      addMockServer: (server) => {
        const newServer: MockGameServer = {
          ...server,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          mockServers: [...state.mockServers, newServer],
        }));
        get().addConsoleLog({
          level: 'info',
          source: 'sandbox',
          message: `Mock server "${server.name}" created`,
        });
      },
      removeMockServer: (id) => {
        const server = get().mockServers.find(s => s.id === id);
        set((state) => ({
          mockServers: state.mockServers.filter(s => s.id !== id),
        }));
        if (server) {
          get().addConsoleLog({
            level: 'info',
            source: 'sandbox',
            message: `Mock server "${server.name}" removed`,
          });
        }
      },
      updateMockServer: (id, updates) => {
        set((state) => ({
          mockServers: state.mockServers.map(s =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      // User
      currentUser: defaultUser,
      setCurrentUser: (user) => set({ currentUser: user }),

      // Console
      consoleLogs: [],
      addConsoleLog: (log) => {
        const newLog: ConsoleLog = {
          ...log,
          id: generateId(),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          consoleLogs: [newLog, ...state.consoleLogs].slice(0, 500),
        }));
      },
      clearConsoleLogs: () => set({ consoleLogs: [] }),

      // UI State
      selectedExtension: null,
      setSelectedExtension: (id) => set({ selectedExtension: id }),
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      activeTab: 'extensions',
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: 'gamecp-sandbox-storage',
      partialize: (state) => ({
        extensions: state.extensions,
        mockServers: state.mockServers,
        currentUser: state.currentUser,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
