'use server';

import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

export interface BenchmarkResult {
    rank: number;
    totalPeers: number;
    percentile: number; // Top X%
    ageRange: string;
    averageBalance: number;
    topPeerBalance: number;
}

export async function getSocialBenchmark(): Promise<BenchmarkResult | null> {
    const user = await currentUser();
    if (!user) return null;

    // 1. Get Current User Data
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { portfolio: true }
    });

    if (!dbUser || !dbUser.portfolio) return null;

    // 2. Determine Age (Mock if missing for Demo)
    let birthDate = dbUser.birthDate;
    if (!birthDate) {
        // Auto-fix for demo: Set random age between 25-55
        // Consistently based on User ID to be deterministic-ish? No, just set to 1985 (41 years old)
        birthDate = new Date('1985-01-01');

        // Lazy update
        await prisma.user.update({
            where: { id: user.id },
            data: { birthDate: birthDate }
        });
    }

    const birthYear = birthDate.getFullYear();
    const startYear = birthYear - 5;
    const endYear = birthYear + 5;

    // 3. Query Peers in +/- 5 years range
    const peers = await prisma.user.findMany({
        where: {
            birthDate: {
                gte: new Date(`${startYear}-01-01`),
                lte: new Date(`${endYear}-12-31`)
            },
            portfolio: {
                isNot: null
            }
        },
        include: {
            portfolio: true
        }
    });

    // 4. Calculate Rank
    const userBalance = dbUser.portfolio.totalBalance;

    // Sort descending
    const sortedPeers = peers
        .map(p => ({ id: p.id, balance: p.portfolio?.totalBalance || 0 }))
        .sort((a, b) => b.balance - a.balance);

    const rank = sortedPeers.findIndex(p => p.id === user.id) + 1;
    const totalPeers = peers.length;

    // Top X % = (Rank / Total) * 100
    // Example: Rank 1 of 100 => 1% (Top 1%)
    // Example: Rank 10 of 100 => 10%
    const percentile = Math.round((rank / totalPeers) * 100);

    const averageBalance = peers.reduce((sum, p) => sum + (p.portfolio?.totalBalance || 0), 0) / totalPeers;
    const topPeerBalance = sortedPeers[0]?.balance || 0;

    return {
        rank,
        totalPeers,
        percentile,
        ageRange: `${2024 - endYear} - ${2024 - startYear}`,
        averageBalance,
        topPeerBalance
    };
}
