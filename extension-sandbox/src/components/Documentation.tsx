'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    HiOutlineBookOpen,
    HiOutlineRocketLaunch,
    HiOutlinePuzzlePiece,
    HiOutlineCodeBracket,
    HiOutlineCube,
    HiOutlineShieldCheck,
    HiOutlineArrowTopRightOnSquare,
    HiOutlineClipboard,
    HiOutlineCheck,
} from 'react-icons/hi2';

interface DocSection {
    id: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    content: React.ReactNode;
}

export default function Documentation() {
    const [activeSection, setActiveSection] = useState('getting-started');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const copyToClipboard = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const sections: DocSection[] = [
        {
            id: 'getting-started',
            title: 'Getting Started',
            icon: HiOutlineRocketLaunch,
            content: (
                <div className="space-y-6">
                    <p className="text-muted">
                        Welcome to the GameCP Extension Sandbox! This environment allows you to develop,
                        test, and debug extensions before publishing them to the App Store.
                    </p>

                    <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                        <h4 className="font-medium text-accent mb-2">Quick Start</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-muted">
                            <li>Install an extension by uploading its <code className="text-foreground">gamecp.json</code> manifest</li>
                            <li>Create mock game servers to test server-specific features</li>
                            <li>Use the console to monitor extension activity</li>
                            <li>Iterate on your extension code and test changes</li>
                        </ol>
                    </div>
                </div>
            ),
        },
        {
            id: 'manifest',
            title: 'Manifest Structure',
            icon: HiOutlinePuzzlePiece,
            content: (
                <div className="space-y-6">
                    <p className="text-muted">
                        Every extension requires a <code className="text-foreground">gamecp.json</code> manifest file that describes the extension.
                    </p>

                    <CodeBlock
                        id="manifest-example"
                        language="json"
                        code={`{
  "extension_id": "my-extension",
  "version": "1.0.0",
  "name": "My Extension",
  "description": "A brief description",
  "author": "Your Name",
  "ui_bundle": "dist/index.js",
  "handlers_bundle": "dist/handlers.js",
  "metadata": {
    "icon": "assets/icon.png",
    "category": "utilities"
  },
  "ui_injection": [
    {
      "method": "MOUNT",
      "target": "global.sidebar.nav",
      "component": "MyNavLink",
      "order": 100
    }
  ],
  "sandbox_config": {
    "db_collections": ["my_data"],
    "permissions": ["network.outbound"]
  }
}`}
                        copied={copiedCode === 'manifest-example'}
                        onCopy={() => copyToClipboard('...', 'manifest-example')}
                    />
                </div>
            ),
        },
        {
            id: 'ui-injection',
            title: 'UI Injection',
            icon: HiOutlineCube,
            content: (
                <div className="space-y-6">
                    <p className="text-muted">
                        Extensions can inject UI components into various parts of the GameCP interface.
                    </p>

                    <h4 className="font-medium text-foreground">Injection Methods</h4>
                    <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-sidebar border border-border">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="badge badge-info">MOUNT</span>
                                <span className="font-medium text-foreground">Mount Component</span>
                            </div>
                            <p className="text-sm text-muted">
                                Mounts a component at a specific injection point (sidebar, nav, footer, etc.)
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-sidebar border border-border">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="badge badge-success">HANDLER</span>
                                <span className="font-medium text-foreground">Route Handler</span>
                            </div>
                            <p className="text-sm text-muted">
                                Creates a new page route that your extension handles
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-sidebar border border-border">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="badge badge-warning">AUGMENT</span>
                                <span className="font-medium text-foreground">Augment Existing</span>
                            </div>
                            <p className="text-sm text-muted">
                                Adds content to an existing page or component
                            </p>
                        </div>
                    </div>

                    <h4 className="font-medium text-foreground mt-6">Available Targets</h4>
                    <div className="code-block text-xs">
                        <pre>{`# Global targets
global.sidebar.nav       # Main sidebar navigation
global.sidebar.footer    # Main sidebar footer

# Server-specific targets
server.sidebar.nav       # Game server sidebar
server.dashboard.page    # Server dashboard

# Dashboard targets
dashboard.page           # Main dashboard

# Game editor targets
games.edit.form          # Game config form
games.edit.navigation    # Game editor navigation`}</pre>
                    </div>
                </div>
            ),
        },
        {
            id: 'handlers',
            title: 'Backend Handlers',
            icon: HiOutlineCodeBracket,
            content: (
                <div className="space-y-6">
                    <p className="text-muted">
                        Extensions can define backend handlers that run in a secure sandboxed environment.
                    </p>

                    <CodeBlock
                        id="handler-example"
                        language="typescript"
                        code={`import type { ExtensionContext, ApiResponse } from '@gamecp/types';

export async function getItems(ctx: ExtensionContext): Promise<ApiResponse> {
  // Access request data
  const { serverId } = ctx.request.query;
  
  // Use database (scoped to your extension)
  const items = await ctx.db
    .collection('items')
    .find({ serverId })
    .toArray();
  
  // Make external HTTP requests
  const response = await ctx.http.get('https://api.example.com/data');
  
  // Log for debugging
  ctx.logger.info('Fetched items', { count: items.length });
  
  return {
    status: 200,
    body: { items }
  };
}`}
                        copied={copiedCode === 'handler-example'}
                        onCopy={() => copyToClipboard('...', 'handler-example')}
                    />

                    <h4 className="font-medium text-foreground mt-6">Context API</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-sidebar border border-border">
                            <code className="text-sm text-accent">ctx.db</code>
                            <p className="text-xs text-muted mt-1">MongoDB-like database API</p>
                        </div>
                        <div className="p-3 rounded-lg bg-sidebar border border-border">
                            <code className="text-sm text-accent">ctx.http</code>
                            <p className="text-xs text-muted mt-1">HTTP client for external requests</p>
                        </div>
                        <div className="p-3 rounded-lg bg-sidebar border border-border">
                            <code className="text-sm text-accent">ctx.logger</code>
                            <p className="text-xs text-muted mt-1">Logging utilities</p>
                        </div>
                        <div className="p-3 rounded-lg bg-sidebar border border-border">
                            <code className="text-sm text-accent">ctx.user</code>
                            <p className="text-xs text-muted mt-1">Current user info & role</p>
                        </div>
                        <div className="p-3 rounded-lg bg-sidebar border border-border">
                            <code className="text-sm text-accent">ctx.instance</code>
                            <p className="text-xs text-muted mt-1">Game server control (start/stop)</p>
                        </div>
                        <div className="p-3 rounded-lg bg-sidebar border border-border">
                            <code className="text-sm text-accent">ctx.config</code>
                            <p className="text-xs text-muted mt-1">Extension configuration</p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'sandbox',
            title: 'Security & Sandbox',
            icon: HiOutlineShieldCheck,
            content: (
                <div className="space-y-6">
                    <p className="text-muted">
                        Extensions run in an isolated environment with strict resource limits and permissions.
                    </p>

                    <h4 className="font-medium text-foreground">Resource Limits</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-4 rounded-lg bg-sidebar border border-border text-center">
                            <p className="text-2xl font-bold text-foreground">128 MB</p>
                            <p className="text-xs text-muted">Memory Limit</p>
                        </div>
                        <div className="p-4 rounded-lg bg-sidebar border border-border text-center">
                            <p className="text-2xl font-bold text-foreground">5 sec</p>
                            <p className="text-xs text-muted">Execution Timeout</p>
                        </div>
                        <div className="p-4 rounded-lg bg-sidebar border border-border text-center">
                            <p className="text-2xl font-bold text-foreground">Scoped</p>
                            <p className="text-xs text-muted">Database Access</p>
                        </div>
                    </div>

                    <h4 className="font-medium text-foreground mt-6">Permissions</h4>
                    <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-sidebar border border-border">
                            <div className="flex items-center gap-2">
                                <span className="badge badge-warning">network.outbound</span>
                                <span className="text-sm text-foreground">Required for external HTTP requests</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-danger/5 border border-danger/20 mt-6">
                        <h4 className="font-medium text-danger mb-2">Restrictions</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted">
                            <li>No file system access</li>
                            <li>No process spawning</li>
                            <li>No eval() or dynamic code execution</li>
                            <li>Database limited to declared collections</li>
                        </ul>
                    </div>
                </div>
            ),
        },
    ];

    const activeContent = sections.find(s => s.id === activeSection);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Documentation</h1>
                <p className="text-sm text-muted mt-1">
                    Learn how to build GameCP extensions
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <div className="lg:w-64 shrink-0">
                    <nav className="sticky top-32 space-y-1">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.id;

                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`
                    w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors
                    ${isActive
                                            ? 'bg-primary text-background'
                                            : 'text-muted hover:text-foreground hover:bg-sidebar'
                                        }
                  `}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{section.title}</span>
                                </button>
                            );
                        })}

                        <div className="pt-4 mt-4 border-t border-border">
                            <a
                                href="https://github.com/GameCP/apps"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-4 py-2.5 text-muted hover:text-foreground hover:bg-sidebar rounded-lg transition-colors"
                            >
                                <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                                <span className="text-sm font-medium">View Examples</span>
                            </a>
                        </div>
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-xl bg-card border border-border"
                    >
                        {activeContent && (
                            <>
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                        <activeContent.icon className="w-5 h-5 text-accent" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-foreground">
                                        {activeContent.title}
                                    </h2>
                                </div>
                                {activeContent.content}
                            </>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

interface CodeBlockProps {
    id: string;
    language: string;
    code: string;
    copied: boolean;
    onCopy: () => void;
}

function CodeBlock({ id, language, code, copied, onCopy }: CodeBlockProps) {
    return (
        <div className="relative group">
            <button
                onClick={onCopy}
                className="absolute top-3 right-3 p-2 rounded-lg bg-card border border-border opacity-0 group-hover:opacity-100 transition-opacity"
            >
                {copied ? (
                    <HiOutlineCheck className="w-4 h-4 text-success" />
                ) : (
                    <HiOutlineClipboard className="w-4 h-4 text-muted" />
                )}
            </button>
            <div className="code-block">
                <pre className="text-xs overflow-x-auto">
                    <code>{code}</code>
                </pre>
            </div>
        </div>
    );
}
