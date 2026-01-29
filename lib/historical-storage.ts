export interface HistoricalFund {
    name: string;
    value: number;
    units: number;
    navPerUnit: number;
}

export interface MonthlySnapshot {
    year: number;
    month: number; // 1-12
    date: string; // YYYY-MM-DD
    funds: HistoricalFund[];
    totalValue: number;
    source: 'pdf' | 'manual';
}

// For backward compatibility with old yearly snapshots
export interface HistoricalSnapshot {
    year: number;
    date: string;
    funds: HistoricalFund[];
    totalValue: number;
    source: 'pdf' | 'manual'; // Track how data was entered
}

export interface HistoricalData {
    snapshots: HistoricalSnapshot[];
}

export interface MonthlyData {
    monthly: MonthlySnapshot[];
}

const STORAGE_KEY = 'gpf-historical-data';
const MONTHLY_STORAGE_KEY = 'gpf-monthly-data';

// ===== Monthly Storage Functions =====

export function saveMonthlySnapshots(snapshots: MonthlySnapshot[]): void {
    const existing = loadMonthlyData();

    // Remove snapshots for same year-months
    const existingKeys = new Set(
        snapshots.map(s => `${s.year}-${s.month}`)
    );

    const filtered = existing.monthly.filter(
        s => !existingKeys.has(`${s.year}-${s.month}`)
    );

    // Add new snapshots
    filtered.push(...snapshots);

    // Sort by year, then month
    filtered.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });

    const data: MonthlyData = {
        monthly: filtered
    };

    if (typeof window !== 'undefined') {
        localStorage.setItem(MONTHLY_STORAGE_KEY, JSON.stringify(data));
    }
}

export function loadMonthlyData(): MonthlyData {
    if (typeof window === 'undefined') {
        return { monthly: [] };
    }

    const stored = localStorage.getItem(MONTHLY_STORAGE_KEY);
    if (!stored) {
        return { monthly: [] };
    }

    try {
        return JSON.parse(stored);
    } catch (error) {
        console.error('Error loading monthly data:', error);
        return { monthly: [] };
    }
}

export function getSnapshotsByYear(year: number): MonthlySnapshot[] {
    const data = loadMonthlyData();
    return data.monthly.filter(s => s.year === year);
}

export function getSnapshotByYearMonth(year: number, month: number): MonthlySnapshot | null {
    const data = loadMonthlyData();
    return data.monthly.find(s => s.year === year && s.month === month) || null;
}

export function deleteSnapshotsByYear(year: number): void {
    const data = loadMonthlyData();
    const filtered = data.monthly.filter(s => s.year !== year);

    if (typeof window !== 'undefined') {
        localStorage.setItem(MONTHLY_STORAGE_KEY, JSON.stringify({ monthly: filtered }));
    }
}

export function deleteSnapshotByYearMonth(year: number, month: number): void {
    const data = loadMonthlyData();
    const filtered = data.monthly.filter(s => !(s.year === year && s.month === month));

    if (typeof window !== 'undefined') {
        localStorage.setItem(MONTHLY_STORAGE_KEY, JSON.stringify({ monthly: filtered }));
    }
}

export function getAllYears(): number[] {
    const data = loadMonthlyData();
    const years = [...new Set(data.monthly.map(s => s.year))];
    return years.sort((a, b) => a - b);
}

export function getAllMonthsForYear(year: number): number[] {
    const snapshots = getSnapshotsByYear(year);
    return snapshots.map(s => s.month).sort((a, b) => a - b);
}

// Get latest snapshot for a year (last month with data)
export function getLatestSnapshotForYear(year: number): MonthlySnapshot | null {
    const snapshots = getSnapshotsByYear(year);
    if (snapshots.length === 0) return null;

    // Return last month
    return snapshots[snapshots.length - 1];
}

// ===== Legacy Functions (for backward compatibility) =====

export function saveHistoricalSnapshot(snapshot: HistoricalSnapshot): void {
    const existing = loadHistoricalData();

    // Remove existing snapshot for the same year if it exists
    const filtered = existing.snapshots.filter(s => s.year !== snapshot.year);

    // Add new snapshot
    filtered.push(snapshot);

    // Sort by year
    filtered.sort((a, b) => a.year - b.year);

    const data: HistoricalData = {
        snapshots: filtered
    };

    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
}

export function loadHistoricalData(): HistoricalData {
    if (typeof window === 'undefined') {
        return { snapshots: [] };
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        return { snapshots: [] };
    }

    try {
        return JSON.parse(stored);
    } catch (error) {
        console.error('Error loading historical data:', error);
        return { snapshots: [] };
    }
}

export function getSnapshotByYear(year: number): HistoricalSnapshot | null {
    const data = loadHistoricalData();
    return data.snapshots.find(s => s.year === year) || null;
}

export function deleteSnapshotByYear(year: number): void {
    const data = loadHistoricalData();
    const filtered = data.snapshots.filter(s => s.year !== year);

    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ snapshots: filtered }));
    }
}
