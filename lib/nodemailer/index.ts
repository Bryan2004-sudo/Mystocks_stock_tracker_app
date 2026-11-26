
import nodemailer from "nodemailer";

import {
    WELCOME_EMAIL_TEMPLATE,
    NEWS_SUMMARY_EMAIL_TEMPLATE,
} from "@/lib/nodemailer/templates";

// =====================================================
// EMAIL DATA TYPES
// =====================================================

type WelcomeEmailData = {
    email: string;
    name: string;
    intro: string;
};

type NewsSummaryEmailData = {
    email: string;
    date: string;
    newsContent: string;
};

// =====================================================
// NODEMAILER TRANSPORTER
// =====================================================

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
    },
});

// =====================================================
// HTML ESCAPING HELPER
// =====================================================

// Safely insert plain text into the existing HTML template.
const escapeHtml = (value: string): string => {
    return value.replace(/[&<>"']/g, (char) => {
        const entities: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };

        return entities[char];
    });
};

// =====================================================
// 1. SEND WELCOME EMAIL
// =====================================================

export const sendWelcomeEmail = async ({
                                           email,
                                           name,
                                           intro,
                                       }: WelcomeEmailData) => {
    const senderEmail = process.env.NODEMAILER_EMAIL;
    const senderPassword = process.env.NODEMAILER_PASSWORD;

    if (!senderEmail || !senderPassword) {
        throw new Error(
            "Nodemailer email or password is missing in .env.local"
        );
    }

    if (!email || !name) {
        throw new Error(
            "Recipient email and name are required."
        );
    }

    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
        .replaceAll("{{name}}", escapeHtml(name))
        .replaceAll(
            "{{intro}}",
            escapeHtml(intro).replace(/\r?\n/g, "<br />")
        );

    const mailOptions = {
        from: `"Mystocks" <${senderEmail}>`,
        to: email,
        subject:
            "Welcome to My Stocks - your stock market toolkit is ready!",
        text: `Hi ${name},

${intro}

Thanks for joining Mystocks!`,
        html: htmlTemplate,
    };

    const info = await transporter.sendMail(mailOptions);

    console.info("Welcome email SMTP result:", {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
    });

    const recipientAccepted = info.accepted.some(
        (address) =>
            address.toLowerCase() === email.toLowerCase()
    );

    if (!recipientAccepted) {
        throw new Error(
            "The email provider did not accept the welcome email recipient."
        );
    }

    return {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
    };
};

// =====================================================
// 2. SEND DAILY NEWS SUMMARY EMAIL
// =====================================================

export const sendNewsSummaryEmail = async ({
                                               email,
                                               date,
                                               newsContent,
                                           }: NewsSummaryEmailData): Promise<void> => {
    const senderEmail = process.env.NODEMAILER_EMAIL;
    const senderPassword = process.env.NODEMAILER_PASSWORD;

    // Step 1: Validate SMTP configuration.
    if (!senderEmail || !senderPassword) {
        throw new Error(
            "Nodemailer email or password is missing in .env.local"
        );
    }

    // Step 2: Validate recipient and email content.
    if (!email || !email.includes("@")) {
        throw new Error(
            "A valid recipient email is required."
        );
    }

    if (!date || !date.trim()) {
        throw new Error(
            "News summary date is required."
        );
    }

    if (!newsContent || !newsContent.trim()) {
        throw new Error(
            "News summary content is required."
        );
    }

    // Step 3: Build the HTML news email.
    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replaceAll("{{date}}", escapeHtml(date))
        .replaceAll("{{newsContent}}", newsContent);

    // Step 4: Configure email options.
    const mailOptions = {
        from: '"Signalist News" <signalist@jsmastery.pro>',
        to: email,
        subject: `📰 Market News Summary Today - ${date}`,
        text: "Today's market news summary from Signalist.",
        html: htmlTemplate,
    };

    // Step 5: Send using the existing Gmail transporter.
    await transporter.sendMail(mailOptions);
};
