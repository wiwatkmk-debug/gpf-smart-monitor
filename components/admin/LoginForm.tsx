'use client';

import { useState } from 'react';
import Card from '../ui/Card';

interface LoginFormProps {
    onLogin: (password: string) => void;
    error?: string;
}

export default function LoginForm({ onLogin, error }: LoginFormProps) {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 500));

        onLogin(password);
        setIsLoading(false);
    };

    return (
        <Card>
            <div className="max-w-md mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
                    🔐 Admin Login
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium mb-2"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg glass border"
                            style={{
                                borderColor: 'var(--border-color)',
                                color: 'var(--text-primary)',
                            }}
                            placeholder="Enter admin password"
                            required
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <p className="text-sm text-red-500">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !password}
                        className="w-full px-4 py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        💡 <strong>Default password:</strong> admin123
                    </p>
                    <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                        เปลี่ยน password ได้ที่ <code className="px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>.env.local</code>
                    </p>
                </div>
            </div>
        </Card>
    );
}
