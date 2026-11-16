
"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";
import { inngest } from "@/lib/inngest/client";

type SignUpWithEmailParams = {
    email: string;
    password: string;
    fullName: string;
    country: string;
    investmentGoals: string;
    riskTolerance: string;
    preferredIndustry: string;
};

type SignInWithEmailParams = {
    email: string;
    password: string;
};

type AuthResult =
    | {
    success: true;
    warning?: string;
}
    | {
    success: false;
    error: string;
};

// SIGN UP
export const signUpWithEmail = async ({
                                          email,
                                          password,
                                          fullName,
                                          country,
                                          investmentGoals,
                                          riskTolerance,
                                          preferredIndustry,
                                      }: SignUpWithEmailParams): Promise<AuthResult> => {
    try {
        const response = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name: fullName,
            },
        });

        if (!response?.user) {
            return {
                success: false,
                error: "Sign up failed.",
            };
        }

        try {
            await inngest.send({
                name: "app/user.created",
                data: {
                    email,
                    name: fullName,
                    country,
                    investmentGoals,
                    riskTolerance,
                    preferredIndustry,
                },
            });
        } catch (error) {
            console.error(
                "Account created, but Inngest event failed:",
                error
            );

            return {
                success: true,
                warning:
                    "Account created, but the welcome event could not be queued.",
            };
        }

        return {
            success: true,
        };
    } catch (error) {
        console.error("Sign up failed:", error);

        return {
            success: false,
            error: "Sign up failed.",
        };
    }
};

// SIGN IN
export const signInWithEmail = async ({
                                          email,
                                          password,
                                      }: SignInWithEmailParams): Promise<AuthResult> => {
    try {
        const response = await auth.api.signInEmail({
            body: {
                email,
                password,
            },
            headers: await headers(),
        });

        if (!response?.user) {
            return {
                success: false,
                error: "Invalid email or password.",
            };
        }

        return {
            success: true,
        };
    } catch (error) {
        console.error("Sign in failed:", error);

        return {
            success: false,
            error: "Invalid email or password.",
        };
    }
};

// SIGN OUT
export const signOut = async (): Promise<AuthResult> => {
    try {
        await auth.api.signOut({
            headers: await headers(),
        });

        return {
            success: true,
        };
    } catch (error) {
        console.error("Sign out failed:", error);

        return {
            success: false,
            error: "Failed to sign out.",
        };
    }
};
