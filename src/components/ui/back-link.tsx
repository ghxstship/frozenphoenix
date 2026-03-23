import * as React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackLinkProps {
    href: string;
    label?: string | undefined;
    className?: string | undefined;
}

export function BackLink({ href, label = "Back", className }: BackLinkProps) {
    return (
        <Link
            href={href}
            className={cn(
                "group inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4",
                className
            )}
            aria-label={`Go back to ${label}`}
        >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            {label}
        </Link>
    );
}
