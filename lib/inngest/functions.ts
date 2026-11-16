
import { inngest } from "@/lib/inngest/client";
import { PERSONALIZED_WELCOME_EMAIL_PROMPT } from "@/lib/inngest/prompts";
import { sendWelcomeEmail } from "@/lib/nodemailer";

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

        // Step 1: Prepare the user's investment profile.
        const userProfile = `
            - Country: ${event.data.country}
            - Investment goals: ${event.data.investmentGoals}
            - Risk tolerance: ${event.data.riskTolerance}
            - Preferred industry: ${event.data.preferredIndustry}
        `;

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(
            "{{userProfile}}",
            userProfile
        );

        // Step 2: Generate the personalized welcome introduction.
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

        // Step 3: Prepare the final introduction.
        const introText = await step.run(
            "prepare-welcome-email",
            async () => {
                const part =
                    response.candidates?.[0]?.content?.parts?.[0];

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

        // Step 4: Send the actual welcome email through Gmail.
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

        // Step 5: Report the successful SMTP submission.
        return {
            success: true,
            message: "Welcome email sent successfully.",
            recipient: email,
            messageId: emailResult.messageId,
            introText,
        };
    }
);
