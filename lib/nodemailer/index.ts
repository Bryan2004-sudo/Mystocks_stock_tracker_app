
import nodemailer from "nodemailer";
import { WELCOME_EMAIL_TEMPLATE } from "@/lib/nodemailer/templates";

type WelcomeEmailData = {
    email: string;
    name: string;
    intro: string;
};

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
    },
});

// Safely insert text into the existing HTML template.
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
