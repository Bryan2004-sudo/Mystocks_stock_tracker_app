import Link from "next/link";
import Image from "next/image";
import NavItems from "@/components/NavItems";
import UserDropdown from "@/components/UserDropdown";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 header">
            <div className="container header-wrapper flex items-center justify-between gap-4">

                {/* Signalist Logo */}
                <Link href="/" className="shrink-0">
                    <Image
                        src="/assets/icons/logo.svg"
                        alt="Signalist logo"
                        width={140}
                        height={32}
                        loading="eager"
                        className="h-8 w-auto cursor-pointer"
                    />
                </Link>

                {/* Desktop Navigation */}
                <nav
                    className="hidden sm:flex flex-1 items-center justify-center"
                    aria-label="Main navigation"
                >
                    <NavItems />
                </nav>

                {/* User Dropdown - Desktop and Mobile */}
                <div className="flex shrink-0 items-center sm:ml-auto">
                    <UserDropdown />
                </div>

            </div>
        </header>
    );
}