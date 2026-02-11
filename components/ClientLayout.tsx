'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

    if (isAuthPage) {
        return (
            <main className="w-full min-h-screen flex items-center justify-center bg-gray-50">
                {children}
            </main>
        );
    }

    return (
        <>
            <Sidebar />
            <main
                className="flex-1 px-8 pb-8 mt-16 pt-6 md:mt-0 md:pt-12 md:px-24 lg:px-32 transition-all duration-300 overflow-x-hidden"
                style={{ marginTop: '4rem', paddingTop: '1.5rem' }}
            >
                {children}
            </main>
        </>
    );
}
