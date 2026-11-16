
"use client";

import Link from "next/link";
import { Menu, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { NAV_ITEMS } from "@/lib/constants";
import { signOut } from "@/lib/actions/auth.actions";

import { Button } from "@/components/ui/button";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

type User = {
    id: string;
    name: string;
    email: string;
    image?: string | null;
};

type UserDropdownProps = {
    user: User;
};

const UserDropdown = ({ user }: UserDropdownProps) => {
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            const result = await signOut();

            if (!result.success) {
                toast.error("Failed to sign out", {
                    description: result.error,
                });
                return;
            }

            toast.success("Signed out successfully");

            router.replace("/sign-in");
            router.refresh();
        } catch (error) {
            console.error("Sign out error:", error);

            toast.error("Failed to sign out", {
                description:
                    error instanceof Error
                        ? error.message
                        : "Something went wrong.",
            });
        }
    };

    const userInitial =
        user.name?.trim().charAt(0).toUpperCase() || "U";

    const avatarUrl =
        user.image || "https://github.com/shadcn.png";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex items-center gap-3 text-gray-400 hover:text-yellow-500"
                    aria-label="Open user menu"
                >
                    <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage
                            src={avatarUrl}
                            alt={user.name}
                        />

                        <AvatarFallback className="bg-yellow-500 text-yellow-900 text-sm font-bold">
                            {userInitial}
                        </AvatarFallback>
                    </Avatar>

                    <div className="hidden sm:flex flex-col items-start">
                        <span className="text-base font-medium text-gray-400">
                            {user.name}
                        </span>
                    </div>

                    <Menu className="size-5 sm:hidden" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-56 text-gray-400"
            >
                {/* User Information */}
                <DropdownMenuLabel>
                    <div className="flex items-center gap-3 py-2">
                        <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage
                                src={avatarUrl}
                                alt={user.name}
                            />

                            <AvatarFallback className="bg-yellow-500 text-yellow-900 text-sm font-bold">
                                {userInitial}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex min-w-0 flex-col">
                            <span className="text-sm font-medium text-gray-100">
                                {user.name}
                            </span>

                            <span className="truncate text-xs text-gray-400">
                                {user.email}
                            </span>
                        </div>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-gray-600" />

                {/* Mobile Navigation Only */}
                <DropdownMenuGroup className="sm:hidden">
                    {NAV_ITEMS.map(({ href, label }) => (
                        <DropdownMenuItem key={href} asChild>
                            <Link
                                href={href}
                                className="cursor-pointer text-gray-100 focus:text-yellow-500"
                            >
                                {label}
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="sm:hidden bg-gray-600" />

                {/* Account Menu */}
                <DropdownMenuGroup>
                    <DropdownMenuLabel>
                        My Account
                    </DropdownMenuLabel>

                    <DropdownMenuItem>
                        Profile
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                        Billing
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-gray-600" />

                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        Team
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                        Subscription
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-gray-600" />

                {/* Log Out */}
                <DropdownMenuItem
                    onSelect={(event) => {
                        event.preventDefault();
                        void handleSignOut();
                    }}
                    className="cursor-pointer text-gray-100 font-medium focus:bg-transparent focus:text-yellow-500 transition-colors"
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserDropdown;
