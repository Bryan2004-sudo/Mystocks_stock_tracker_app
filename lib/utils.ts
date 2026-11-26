
export { cn } from "cn";

/**
 * Normalize and deduplicate stock symbols.
 */
export const normalizeStockSymbols = (
    symbols: readonly string[] = []
): string[] => {
    const uniqueSymbols = new Set<string>();

    for (const value of symbols) {
        if (typeof value !== "string") {
            continue;
        }

        const symbol = value.trim().toUpperCase();

        if (/^[A-Z0-9.^-]{1,20}$/.test(symbol)) {
            uniqueSymbols.add(symbol);
        }
    }

    return Array.from(uniqueSymbols);
};

/**
 * Generate a UTC date range for Finnhub news.
 * Default: last five days.
 */
export const getNewsDateRange = (
    days: number = 5
): {
    from: string;
    to: string;
    earliestTimestamp: number;
} => {
    const now = new Date();

    const safeDays = Number.isFinite(days)
        ? Math.max(0, Math.floor(days))
        : 5;

    const start = new Date(
        now.getTime() -
        safeDays * 24 * 60 * 60 * 1000
    );

    return {
        from: start.toISOString().slice(0, 10),
        to: now.toISOString().slice(0, 10),
        earliestTimestamp: Math.floor(
            start.getTime() / 1000
        ),
    };
};
