'use server';

import { GPFAccount, FundHolding, HistorySnapshot } from '@/types/gpf';
import { MOCK_GPF_ACCOUNT } from '@/lib/mock-gpf-data';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

export async function getPortfolio(): Promise<GPFAccount> {
    const user = await currentUser();

    if (!user) {
        console.log("No authenticated user, returning mock data.");
        return MOCK_GPF_ACCOUNT;
    }

    try {
        // 1. Ensure User exists in our DB
        // We use upsert to update email if it changed, or create if new
        const dbUser = await prisma.user.upsert({
            where: { id: user.id },
            update: { email: user.emailAddresses[0]?.emailAddress || "no-email" },
            create: {
                id: user.id,
                email: user.emailAddresses[0]?.emailAddress || "no-email",
            }
        });

        // 2. Get Portfolio
        let dbPortfolio = await prisma.portfolio.findUnique({
            where: { userId: user.id }
        });

        // 3. If no portfolio, create one with default/mock data
        if (!dbPortfolio) {
            dbPortfolio = await prisma.portfolio.create({
                data: {
                    userId: user.id,
                    totalBalance: MOCK_GPF_ACCOUNT.totalBalance,
                    holdings: [], // Start empty or use MOCK holdings if you prefer
                    history: []
                }
            });
        }

        // 4. Map DB result to GPFAccount type
        // Note: Some fields like salary, memberId, plan are still mock for now as they aren't in DB yet
        return {
            ...MOCK_GPF_ACCOUNT,
            totalBalance: dbPortfolio.totalBalance,
            holdings: (dbPortfolio.holdings as unknown as FundHolding[]) || [],
            history: (dbPortfolio.history as unknown as HistorySnapshot[]) || [],
            lastUpdated: dbPortfolio.lastUpdated.toISOString()
        };

    } catch (error) {
        console.error('Failed to get portfolio from DB:', error);
        return MOCK_GPF_ACCOUNT;
    }
}

export async function updatePortfolioHoldings(holdings: FundHolding[]): Promise<GPFAccount> {
    const user = await currentUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    // Calculate new total balance
    const newTotalBalance = holdings.reduce((sum, h) => sum + h.value, 0);
    const updateDate = new Date().toISOString().split('T')[0];

    try {
        // Get current history to append to
        const currentPortfolio = await prisma.portfolio.findUnique({
            where: { userId: user.id }
        });

        const currentHistory = (currentPortfolio?.history as unknown as HistorySnapshot[]) || [];

        // Remove existing entry for today to avoid duplicates
        const filteredHistory = currentHistory.filter(h => !h.date.startsWith(updateDate));

        // New snapshot
        const newSnapshot: HistorySnapshot = {
            date: new Date().toISOString(),
            totalBalance: newTotalBalance,
            holdings: holdings
        };

        const updatedHistory = [...filteredHistory, newSnapshot].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Update DB
        const updatedPortfolio = await prisma.portfolio.update({
            where: { userId: user.id },
            data: {
                holdings: holdings as any, // Cast to any for Prisma Json
                totalBalance: newTotalBalance,
                history: updatedHistory as any,
                lastUpdated: new Date()
            }
        });

        return {
            ...MOCK_GPF_ACCOUNT,
            totalBalance: updatedPortfolio.totalBalance,
            holdings: (updatedPortfolio.holdings as unknown as FundHolding[]),
            history: (updatedPortfolio.history as unknown as HistorySnapshot[]),
            lastUpdated: updatedPortfolio.lastUpdated.toISOString()
        };

    } catch (error) {
        console.error('Failed to update portfolio in DB:', error);
        throw new Error('Database update failed');
    }
}
