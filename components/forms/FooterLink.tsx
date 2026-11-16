"use client";

import Link from "next/link";

type FooterLinkProps = {
    text: string;
    linkText: string;
    href: string;
};

const FooterLink = ({
                        text,
                        linkText,
                        href,
                    }: FooterLinkProps) => {
    return (
        <p className="mt-6 text-center text-sm text-gray-400">
            {text}
            <Link
                href={href}
                className="font-medium text-white transition-colors hover:text-yellow-500"
            >
                {linkText}
            </Link>
        </p>
    );
};

export default FooterLink;