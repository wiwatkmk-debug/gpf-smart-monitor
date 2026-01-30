
export interface RebalancingTransaction {
    id: string;
    date: string; // ISO string
    totalAmount: number;
    items: {
        fundName: string;
        action: 'buy' | 'sell';
        amount: number;
    }[];
    status: 'completed' | 'pending';
}
