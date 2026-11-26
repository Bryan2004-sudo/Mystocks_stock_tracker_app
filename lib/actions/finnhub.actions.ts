
"use server";

import {
    getNewsDateRange,
    normalizeStockSymbols,
} from "@/lib/utils";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

const NEXT_PUBLIC_FINNHUB_API_KEY =
    process.env.FINNHUB_API_KEY ??
    process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

const MAX_ARTICLES = 6;
const NEWS_REVALIDATE_SECONDS = 900;

export type NewsArticle = {
    id: number;
    headline: string;
    summary: string;
    source: string;
    url: string;
    image: string;
    datetime: number;
    category: string;
    related: string;
};

type UnknownRecord = Record<string, unknown>;

const isRecord = (
    value: unknown
): value is UnknownRecord => {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
    );
};

const isSafeUrl = (value: string): boolean => {
    try {
        const parsed = new URL(value);

        return (
            parsed.protocol === "http:" ||
            parsed.protocol === "https:"
        );
    } catch {
        return false;
    }
};

const formatArticle = (
    value: unknown
): NewsArticle | null => {
    if (!isRecord(value)) {
        return null;
    }

    const {
        id,
        headline,
        summary,
        source,
        url,
        image,
        datetime,
        category,
        related,
    } = value;

    if (
        typeof id !== "number" ||
        !Number.isFinite(id) ||
        typeof datetime !== "number" ||
        !Number.isFinite(datetime) ||
        datetime <= 0 ||
        typeof headline !== "string" ||
        !headline.trim() ||
        typeof url !== "string" ||
        !isSafeUrl(url)
    ) {
        return null;
    }

    return {
        id,
        headline: headline.trim(),
        summary:
            typeof summary === "string"
                ? summary.trim()
                : "",
        source:
            typeof source === "string"
                ? source.trim()
                : "",
        url: url.trim(),
        image:
            typeof image === "string" &&
            isSafeUrl(image)
                ? image
                : "",
        datetime,
        category:
            typeof category === "string"
                ? category
                : "",
        related:
            typeof related === "string"
                ? related
                : "",
    };
};

const formatArticles = (
    value: unknown,
    earliestTimestamp: number
): NewsArticle[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    const articles: NewsArticle[] = [];

    for (const item of value as unknown[]) {
        const article = formatArticle(item);

        if (
            article &&
            article.datetime >= earliestTimestamp
        ) {
            articles.push(article);
        }
    }

    return articles.sort(
        (a, b) => b.datetime - a.datetime
    );
};

const fetchJSON = async (
    url: string,
    revalidateSeconds?: number
): Promise<unknown> => {
    const response =
        typeof revalidateSeconds === "number"
            ? await fetch(url, {
                cache: "force-cache",
                next: {
                    revalidate: revalidateSeconds,
                },
            })
            : await fetch(url, {
                cache: "no-store",
            });

    if (response.status !== 200) {
        throw new Error(
            `Finnhub request failed with status ${response.status}`
        );
    }

    return (await response.json()) as unknown;
};

const makeNewsUrl = (
    endpoint: string,
    parameters: Record<string, string>
): string => {
    if (!NEXT_PUBLIC_FINNHUB_API_KEY) {
        throw new Error(
            "Finnhub API key is missing."
        );
    }

    const url = new URL(
        `${FINNHUB_BASE_URL}/${endpoint}`
    );

    for (const [key, value] of Object.entries(parameters)) {
        url.searchParams.set(key, value);
    }

    url.searchParams.set(
        "token",
        NEXT_PUBLIC_FINNHUB_API_KEY
    );

    return url.toString();
};

type SeenArticles = {
    ids: Set<number>;
    urls: Set<string>;
    headlines: Set<string>;
};

const createSeenArticles = (): SeenArticles => ({
    ids: new Set<number>(),
    urls: new Set<string>(),
    headlines: new Set<string>(),
});

const addUniqueArticle = (
    article: NewsArticle,
    results: NewsArticle[],
    seen: SeenArticles
): boolean => {
    const normalizedUrl =
        article.url.trim().toLowerCase();

    const normalizedHeadline =
        article.headline.trim().toLowerCase();

    if (
        seen.ids.has(article.id) ||
        seen.urls.has(normalizedUrl) ||
        seen.headlines.has(normalizedHeadline)
    ) {
        return false;
    }

    seen.ids.add(article.id);
    seen.urls.add(normalizedUrl);
    seen.headlines.add(normalizedHeadline);

    results.push(article);

    return true;
};

const getGeneralNews = async (
    earliestTimestamp: number
): Promise<NewsArticle[]> => {
    const url = makeNewsUrl("news", {
        category: "general",
    });

    const response = await fetchJSON(
        url,
        NEWS_REVALIDATE_SECONDS
    );

    const articles = formatArticles(
        response,
        earliestTimestamp
    );

    const results: NewsArticle[] = [];
    const seen = createSeenArticles();

    for (const article of articles) {
        addUniqueArticle(article, results, seen);

        if (results.length >= MAX_ARTICLES) {
            break;
        }
    }

    return results;
};

export async function getNews(
    symbols?: string[]
): Promise<NewsArticle[]> {
    try {
        const {
            from,
            to,
            earliestTimestamp,
        } = getNewsDateRange(5);

        const cleanSymbols = normalizeStockSymbols(
            symbols ?? []
        ).slice(0, MAX_ARTICLES);

        // No watchlist: fetch general market news.
        if (cleanSymbols.length === 0) {
            return await getGeneralNews(
                earliestTimestamp
            );
        }

        const newsCache =
            new Map<string, NewsArticle[]>();

        const nextIndex =
            new Map<string, number>();

        const results: NewsArticle[] = [];
        const seen = createSeenArticles();

        // Maximum six rounds.
        for (
            let round = 0;
            round < MAX_ARTICLES;
            round++
        ) {
            const symbol =
                cleanSymbols[
                round % cleanSymbols.length
                    ];

            let symbolNews = newsCache.get(symbol);

            if (symbolNews === undefined) {
                const url = makeNewsUrl(
                    "company-news",
                    {
                        symbol,
                        from,
                        to,
                    }
                );

                try {
                    const response = await fetchJSON(
                        url,
                        NEWS_REVALIDATE_SECONDS
                    );

                    symbolNews = formatArticles(
                        response,
                        earliestTimestamp
                    );
                } catch (error) {
                    console.error(
                        `Failed to fetch news for ${symbol}:`,
                        error
                    );

                    symbolNews = [];
                }

                newsCache.set(
                    symbol,
                    symbolNews
                );
            }

            let index =
                nextIndex.get(symbol) ?? 0;

            while (index < symbolNews.length) {
                const article =
                    symbolNews[index];

                index++;

                if (
                    addUniqueArticle(
                        article,
                        results,
                        seen
                    )
                ) {
                    break;
                }
            }

            nextIndex.set(symbol, index);
        }

        // No usable company news: general fallback.
        if (results.length === 0) {
            return await getGeneralNews(
                earliestTimestamp
            );
        }

        return results
            .sort(
                (a, b) =>
                    b.datetime - a.datetime
            )
            .slice(0, MAX_ARTICLES);
    } catch (error) {
        console.error(
            "Failed to fetch news:",
            error
        );

        throw new Error("Failed to fetch news");
    }
}
