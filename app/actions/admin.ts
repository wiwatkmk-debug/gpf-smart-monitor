'use server';

import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

// Security check helper with granular permission
async function checkPermission(requiredRole: 'ADMIN' | 'SUPPORT') {
    const user = await currentUser();
    if (!user) return { allowed: false, user: null };

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return { allowed: false, user: null };

    // Auto-fix for first user (Bootstrap Admin)
    if (dbUser.role === 'USER') {
        const userCount = await prisma.user.count();
        if (userCount === 1) {
            await prisma.user.update({
                where: { id: dbUser.id },
                data: { role: 'ADMIN', status: 'APPROVED' }
            });
            return { allowed: true, user: { ...dbUser, role: 'ADMIN' } };
        }
    }

    // Role Hierarchy: ADMIN > SUPPORT
    const isAllowed =
        dbUser.role === 'ADMIN' ||
        (requiredRole === 'SUPPORT' && dbUser.role === 'SUPPORT');

    return { allowed: isAllowed, user: dbUser };
}

export async function getAdminStats() {
    const { allowed, user } = await checkPermission('SUPPORT'); // Allow Support to view
    if (!allowed) throw new Error("ขออภัย คุณไม่มีสิทธิ์เข้าถึงส่วนนี้ (Access Denied)");

    // Fetch all users with their portfolios
    const users = await prisma.user.findMany({
        include: { portfolio: true },
        orderBy: { createdAt: 'desc' }
    });

    // Calculate system-wide stats
    const totalUsers = users.length;
    const totalPortfolios = users.filter((u: any) => u.portfolio).length;
    const totalAUM = users.reduce((sum: number, u: any) => sum + (u.portfolio?.totalBalance || 0), 0);
    const pendingRequests = users.filter((u: any) => u.status === 'PENDING').length;

    return {
        currentUserRole: user?.role, // Send role to frontend for UI logic
        users,
        stats: { totalUsers, totalPortfolios, totalAUM, pendingRequests }
    };
}

export async function toggleUserRole(targetUserId: string, currentRole: string) {
    const { allowed } = await checkPermission('ADMIN'); // Only Admin can change roles
    if (!allowed) throw new Error("Unauthorized: Require ADMIN role");

    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    await prisma.user.update({
        where: { id: targetUserId },
        data: { role: newRole } as any
    });
    return { success: true, newRole };
}

export async function approveUser(targetUserId: string) {
    const { allowed } = await checkPermission('SUPPORT'); // Support can approve
    if (!allowed) throw new Error("Unauthorized");

    await prisma.user.update({
        where: { id: targetUserId },
        data: { status: 'APPROVED' } as any
    });
    return { success: true };
}

export async function rejectUser(targetUserId: string) {
    const { allowed } = await checkPermission('SUPPORT'); // Support can reject
    if (!allowed) throw new Error("Unauthorized");

    await prisma.user.update({
        where: { id: targetUserId },
        data: { status: 'REJECTED' } as any
    });
    return { success: true };
}

export async function updateSystemConfigAction(key: string, value: string) {
    const { allowed } = await checkPermission('ADMIN'); // Only Admin
    if (!allowed) throw new Error("Unauthorized: Require ADMIN role");

    const { updateSystemConfig } = await import('@/lib/system-config');
    await updateSystemConfig(key, value);
    return { success: true };
}

export async function grantSubscriptionAction(userId: string, months: number) {
    const { allowed } = await checkPermission('ADMIN'); // Only Admin can grant free subs (Money related)
    if (!allowed) throw new Error("Unauthorized: Require ADMIN role");

    const { grantSubscription } = await import('@/lib/subscription');
    await grantSubscription(userId, months);
    return { success: true };
}

export async function getSystemConfigsAction() {
    const { allowed } = await checkPermission('SUPPORT'); // Support can VIEW configs but not edit
    if (!allowed) throw new Error("Unauthorized");

    const { getAllSystemConfigs } = await import('@/lib/system-config');
    return await getAllSystemConfigs();
}
