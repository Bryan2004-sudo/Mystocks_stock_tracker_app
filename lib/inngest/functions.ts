
import { inngest } from "@/lib/inngest/client";

import {
    NEWS_SUMMARY_EMAIL_PROMPT,
    PERSONALIZED_WELCOME_EMAIL_PROMPT,
} from "@/lib/inngest/prompts";

import {
    sendWelcomeEmail,
    sendNewsSummaryEmail,
} from "@/lib/nodemailer";

import { getAllUsersForNewsEmail } from "@/lib/actions/user.actions";
import { getNews } from "@/lib/actions/finnhub.actions";

import { connectToDatabase } from "@/database/mongoose";
import Watchlist from "@/database/models/watchlist.model";

import { normalizeStockSymbols } from "@/lib/utils";

// =====================================================
// 1. PERSONALIZED WELCOME EMAIL
// =====================================================

export const sendSignUpEmail = inngest.createFunction(
    {
        id: "sign-up-email",
        triggers: {
            event: "app/user.created",
        },
    },

    async ({ event, step }) => {
        const { email, name } = event.data;

        if (
            typeof email !== "string" ||
            !email.includes("@") ||
            typeof name !== "string" ||
            !name.trim()
        ) {
            throw new Error(
                "Invalid signup event: email or name is missing."
            );
        }

        // Step 1: Prepare investment profile.
        const userProfile = `
            - Country: ${event.data.country}
            - Investment goals: ${event.data.investmentGoals}
            - Risk tolerance: ${event.data.riskTolerance}
            - Preferred industry: ${event.data.preferredIndustry}
        `;

        const prompt =
            PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(
                "{{userProfile}}",
                userProfile
            );

        // Step 2: Generate personalized introduction.
        const response = await step.ai.infer(
            "generate-welcome-intro",
            {
                model: step.ai.models.gemini({
                    model: "gemini-3.5-flash-lite",
                }),
                body: {
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    text: prompt,
                                },
                            ],
                        },
                    ],
                },
            }
        );

        // Step 3: Prepare introduction text.
        const introText = await step.run(
            "prepare-welcome-email",
            async () => {
                const part =
                    response.candidates?.[0]
                        ?.content?.parts?.[0];

                const generatedText =
                    part && "text" in part
                        ? part.text
                        : null;

                return (
                    generatedText ||
                    "Thanks for joining Signalist. You now have the tools to track markets and make smarter investment decisions."
                );
            }
        );

        // Step 4: Send the welcome email.
        const emailResult = await step.run(
            "send-welcome-email",
            async () => {
                return await sendWelcomeEmail({
                    email,
                    name,
                    intro: introText,
                });
            }
        );

        return {
            success: true,
            message: "Welcome email sent successfully.",
            recipient: email,
            messageId: emailResult.messageId,
            introText,
        };
    }
);

// =====================================================
// 2. DAILY MARKET NEWS SUMMARY
// =====================================================

export const sendDailyNewsSummary = inngest.createFunction(
    {
        id: "daily-news-summary",

        triggers: [
            {
                cron: "0 12 * * *",
            },
            {
                event: "app/send.daily.news",
            },
        ],
    },

    async ({ step }) => {
        // Step 1: Retrieve all registered users.
        const users = await step.run(
            "get-all-users",
            async () => {
                return await getAllUsersForNewsEmail();
            }
        );

        if (users.length === 0) {
            console.info(
                "No users found for daily news."
            );

            return {
                success: true,
                message: "No users found for news email.",
                sent: 0,
                failed: 0,
            };
        }

        // Generate the date used in the email.
        const formatDateToday = new Date().toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "UTC",
            }
        );

        let sentCount = 0;
        let failedCount = 0;

        // Step 2: Process each user's watchlist.
        for (const user of users) {
            try {
                const news = await step.run(
                    `fetch-news-${user.id}`,
                    async () => {
                        await connectToDatabase();

                        const watchlist =
                            await Watchlist.find(
                                {
                                    userId: user.id,
                                },
                                {
                                    symbol: 1,
                                    _id: 0,
                                }
                            ).lean();

                        const symbols =
                            normalizeStockSymbols(
                                watchlist.map(
                                    (item) => item.symbol
                                )
                            );

                        // Fetch company news for the watchlist.
                        // Use general market news if no symbols
                        // or no relevant company news are available.
                        return await getNews(symbols);
                    }
                );

                if (news.length === 0) {
                    console.info(
                        `No news found for user ${user.id}`
                    );

                    continue;
                }

                // Step 3: Summarize the user's news using Gemini.
                const newsPrompt =
                    NEWS_SUMMARY_EMAIL_PROMPT.replace(
                        "{{newsData}}",
                        JSON.stringify(news, null, 2)
                    );

                const summaryResponse = await step.ai.infer(
                    `summarize-news-${user.id}`,
                    {
                        model: step.ai.models.gemini({
                            model: "gemini-3.5-flash-lite",
                        }),
                        body: {
                            contents: [
                                {
                                    role: "user",
                                    parts: [
                                        {
                                            text: newsPrompt,
                                        },
                                    ],
                                },
                            ],
                        },
                    }
                );

                // Extract the generated HTML summary.
                const newsContent = await step.run(
                    `prepare-news-summary-${user.id}`,
                    async () => {
                        const part =
                            summaryResponse.candidates?.[0]
                                ?.content?.parts?.[0];

                        const generatedText =
                            part && "text" in part
                                ? part.text
                                : null;

                        return typeof generatedText === "string"
                            ? generatedText.trim()
                            : "";
                    }
                );

                if (!newsContent) {
                    console.error(
                        `No AI summary generated for ${user.email}`
                    );

                    failedCount++;
                    continue;
                }

                // Step 4: Send the news summary email.
                await step.run(
                    `send-news-email-${user.id}`,
                    async () => {
                        await sendNewsSummaryEmail({
                            email: user.email,
                            date: formatDateToday,
                            newsContent,
                        });

                        return {
                            sent: true,
                            recipient: user.email,
                        };
                    }
                );

                sentCount++;

                console.info(
                    `Daily news summary sent to ${user.email}`
                );
            } catch (error) {
                failedCount++;

                console.error(
                    `Failed to process news for user ${user.id}:`,
                    error
                );
            }
        }

        return {
            success: failedCount === 0,
            message:
                "Daily news summary processing completed.",
            sent: sentCount,
            failed: failedCount,
        };
    }
);
