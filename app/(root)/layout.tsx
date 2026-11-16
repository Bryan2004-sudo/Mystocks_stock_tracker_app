
import type { ReactNode } from "react";
import Header from "@/components/header";
import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";
import { redirect } from "next/navigation";

// Allow request-time authentication checks
export const instant = false;

type LayoutProps = {
    children: ReactNode;
};

const Layout = async ({ children }: LayoutProps) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/sign-in");
    }

    return (
        <main className="min-h-screen text-gray-400">
            <Header user={session.user} />

            <div className="container py-10">
                {children}
            </div>
        </main>
    );
};

export default Layout;
