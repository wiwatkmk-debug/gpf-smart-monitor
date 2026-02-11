import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Check Authentication
    const user = await currentUser();
    if (!user) {
        redirect('/sign-in');
    }

    // 2. Check Role in Database
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id }
    });

    if (!dbUser) {
        // If user doesn't exist in DB, they shouldn't be here (or handled by dashboard logic)
        redirect('/');
    }

    if (dbUser.role !== 'ADMIN' && dbUser.role !== 'SUPPORT') {
        // Strict kick for non-privileged users
        console.warn(`Unauthorized access attempt by ${user.emailAddresses[0]?.emailAddress} (Role: ${dbUser.role})`);
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {children}
        </div>
    );
}
