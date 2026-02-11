import { prisma } from "@/lib/prisma";

export const SYSTEM_CONFIG_KEYS = {
    TRIAL_DAYS: "TRIAL_DAYS",
    SUBSCRIPTION_PRICE_MONTHLY: "SUBSCRIPTION_PRICE_MONTHLY",
    SUBSCRIPTION_PRICE_QUARTERLY: "SUBSCRIPTION_PRICE_QUARTERLY",
    SUBSCRIPTION_PRICE_YEARLY: "SUBSCRIPTION_PRICE_YEARLY",
    BANK_INFO: "BANK_INFO",
    GOOGLE_CHAT_WEBHOOK_URL: "GOOGLE_CHAT_WEBHOOK_URL",
};

export const DEFAULT_CONFIG = {
    [SYSTEM_CONFIG_KEYS.TRIAL_DAYS]: "7",
    [SYSTEM_CONFIG_KEYS.SUBSCRIPTION_PRICE_MONTHLY]: "199",
    [SYSTEM_CONFIG_KEYS.SUBSCRIPTION_PRICE_QUARTERLY]: "599",
    [SYSTEM_CONFIG_KEYS.SUBSCRIPTION_PRICE_YEARLY]: "1990",
    [SYSTEM_CONFIG_KEYS.BANK_INFO]: "ธนาคารกรุงไทย 123-4-56789-0 ชื่อบัญชี GPF AI",
    [SYSTEM_CONFIG_KEYS.GOOGLE_CHAT_WEBHOOK_URL]: "",
};

export async function getSystemConfig(key: string): Promise<string> {
    const config = await prisma.systemConfig.findUnique({
        where: { key },
    });

    if (config) return config.value;

    // If not found, enforce default if exists (and lazy create)
    const defaultValue = DEFAULT_CONFIG[key as keyof typeof DEFAULT_CONFIG];
    if (defaultValue) {
        // Fire and forget creation to speed up read
        prisma.systemConfig.create({
            data: { key, value: defaultValue, description: "Auto-generated default" }
        }).catch(console.error);
        return defaultValue;
    }

    return "";
}

export async function getSystemConfigInt(key: string): Promise<number> {
    const val = await getSystemConfig(key);
    return parseInt(val, 10) || 0;
}

export async function updateSystemConfig(key: string, value: string) {
    return prisma.systemConfig.upsert({
        where: { key },
        update: { value },
        create: { key, value },
    });
}

export async function getAllSystemConfigs() {
    const configs = await prisma.systemConfig.findMany({
        orderBy: { key: 'asc' }
    });

    // Merge with defaults for verifying UI
    const allKeys = Object.keys(DEFAULT_CONFIG);
    const result = [...configs];

    for (const key of allKeys) {
        if (!result.find(c => c.key === key)) {
            result.push({
                key,
                value: DEFAULT_CONFIG[key as keyof typeof DEFAULT_CONFIG],
                description: 'Default',
                updatedAt: new Date()
            });
        }
    }

    return result;
}
