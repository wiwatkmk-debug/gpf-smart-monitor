// Simple admin authentication using localStorage

const AUTH_KEY = 'gpf_admin_auth';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface AuthSession {
    authenticated: boolean;
    expiresAt: number;
}

export function login(password: string): boolean {
    // In production, this should verify against environment variable
    // For now, we'll use a simple check
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

    if (password === correctPassword) {
        const session: AuthSession = {
            authenticated: true,
            expiresAt: Date.now() + SESSION_DURATION,
        };

        if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_KEY, JSON.stringify(session));
        }

        return true;
    }

    return false;
}

export function logout(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_KEY);
    }
}

export function isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    try {
        const sessionData = localStorage.getItem(AUTH_KEY);
        if (!sessionData) return false;

        const session: AuthSession = JSON.parse(sessionData);

        // Check if session is expired
        if (Date.now() > session.expiresAt) {
            logout();
            return false;
        }

        return session.authenticated;
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
}
