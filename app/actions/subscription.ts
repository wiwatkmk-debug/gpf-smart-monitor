'use server';

import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function submitSubscriptionRequest(
    plan: 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
    price: number,
    slipImage: string // Base64
) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // Check if user exists in DB
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) throw new Error("User not found");

    // Create request
    await prisma.subscriptionRequest.create({
        data: {
            userId: user.id,
            plan,
            price,
            slipImage,
            status: 'PENDING'
        }
    });

    return { success: true };
}

export async function getSubscriptionRequests() {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // Check admin permission
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (dbUser?.role !== 'ADMIN' && dbUser?.role !== 'SUPPORT') {
        throw new Error("Access Denied");
    }

    const requests = await prisma.subscriptionRequest.findMany({
        where: { status: 'PENDING' },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
    });

    return requests;
}

export async function approveSubscriptionRequest(requestId: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // Verify Admin
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (dbUser?.role !== 'ADMIN') throw new Error("Only Admin can approve requests");

    const request = await prisma.subscriptionRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new Error("Request not found");

    // Calculate duration based on plan
    let months = 1;
    if (request.plan === 'QUARTERLY') months = 3;
    if (request.plan === 'YEARLY') months = 12;

    // Grant Subscription (reuse existing logic)
    const { grantSubscription } = await import('@/lib/subscription');
    await grantSubscription(request.userId, months);

    // Update Request Status
    await prisma.subscriptionRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' }
    });

    revalidatePath('/admin/dashboard');
    return { success: true };
}

export async function rejectSubscriptionRequest(requestId: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // Verify Admin/Support
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (dbUser?.role !== 'ADMIN' && dbUser?.role !== 'SUPPORT') throw new Error("Unauthorized");

    await prisma.subscriptionRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' }
    });

    revalidatePath('/admin/dashboard');
    return { success: true };
}
