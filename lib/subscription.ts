import { prisma } from "@/lib/prisma";
import { getSystemConfigInt, SYSTEM_CONFIG_KEYS } from "./system-config";

export async function checkSubscription(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            role: true,
            subscriptionStatus: true,
            subscriptionEndsAt: true,
            isTrial: true,
            subscriptionPlan: true
        }
    });

    if (!user) return { allowed: false, reason: "User not found" };

    // Admin and Support always have access
    if (user.role === 'ADMIN' || user.role === 'SUPPORT') {
        return { allowed: true, role: user.role, plan: 'LIFETIME' };
    }

    // Check Expiration
    const now = new Date();
    if (user.subscriptionEndsAt && user.subscriptionEndsAt < now) {
        // Expired
        if (user.subscriptionStatus === 'ACTIVE') {
            // Lazy update status to EXPIRED
            await prisma.user.update({
                where: { id: userId },
                data: { subscriptionStatus: 'EXPIRED' }
            });
        }
        return {
            allowed: false,
            reason: "Subscription Expired",
            isTrial: user.isTrial,
            expiredAt: user.subscriptionEndsAt
        };
    }

    return {
        allowed: true,
        plan: user.subscriptionPlan,
        isTrial: user.isTrial,
        expiresAt: user.subscriptionEndsAt
    };
}

export async function startTrial(userId: string) {
    const trialDays = await getSystemConfigInt(SYSTEM_CONFIG_KEYS.TRIAL_DAYS) || 7;
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + trialDays);

    return prisma.user.update({
        where: { id: userId },
        data: {
            subscriptionPlan: 'FREE',
            subscriptionStatus: 'ACTIVE',
            isTrial: true,
            subscriptionEndsAt: endsAt
        }
    });
}

export async function grantSubscription(userId: string, months: number) {
    const endsAt = new Date();
    endsAt.setMonth(endsAt.getMonth() + months);

    return prisma.user.update({
        where: { id: userId },
        data: {
            subscriptionPlan: 'PREMIUM',
            subscriptionStatus: 'ACTIVE',
            isTrial: false,
            subscriptionEndsAt: endsAt
        }
    });
}
