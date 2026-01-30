'use client';

import { Bell, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function Header() {
    const [darkMode, setDarkMode] = useState(false);
    const [notifications] = useState(2);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.setAttribute('data-theme', !darkMode ? 'dark' : 'light');
    };

    return (
        <header className="glass rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                        <span className="text-2xl">📊</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            GPF Smart Monitor
                        </h1>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            เกษียณมั่นคง ด้วยการวางแผนอัจฉริยะ
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        {darkMode ? (
                            <Sun className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                        ) : (
                            <Moon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                        )}
                    </button>

                    <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <Bell className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                        {notifications > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger rounded-full text-white text-xs flex items-center justify-center font-medium">
                                {notifications}
                            </span>
                        )}
                    </button>

                    {/* Clerk Authentication */}
                    <div className="flex items-center ml-2">
                        <SignedIn>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                                    เข้าสู่ระบบ
                                </button>
                            </SignInButton>
                        </SignedOut>
                    </div>
                </div>
            </div>
        </header>
    );
}
