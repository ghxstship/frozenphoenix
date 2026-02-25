import * as React from "react";
import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
    name?: string;
    src?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
    children?: React.ReactNode;
}

const sizeClasses = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-12 w-12 text-base",
};

const AvatarContext = React.createContext<{ imgLoaded: boolean; setImgLoaded: (v: boolean) => void }>({ imgLoaded: false, setImgLoaded: () => {} });

export function Avatar({ name, src, size = "md", className, children }: AvatarProps) {
    const [imgError, setImgError] = React.useState(false);
    const [imgLoaded, setImgLoaded] = React.useState(false);

    if (children) {
        return (
            <AvatarContext.Provider value={{ imgLoaded, setImgLoaded }}>
                <div className={cn("relative flex shrink-0 overflow-hidden rounded-full", className)}>
                    {children}
                </div>
            </AvatarContext.Provider>
        );
    }

    if (src && !imgError) {
        return (
            <span className={cn("relative inline-block overflow-hidden rounded-full ring-2 ring-background", sizeClasses[size], className)}>
                <Image
                    src={src}
                    alt={name ?? ""}
                    fill
                    sizes="48px"
                    onError={() => setImgError(true)}
                    className="object-cover"
                    unoptimized
                />
            </span>
        );
    }

    return (
        <div className={cn(
            "rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center ring-2 ring-background",
            sizeClasses[size],
            className
        )}>
            {getInitials(name ?? "")}
        </div>
    );
}

export function AvatarImage({ src, alt, className }: { src?: string; alt?: string; className?: string }) {
    const { setImgLoaded } = React.useContext(AvatarContext);
    const [error, setError] = React.useState(false);
    React.useEffect(() => { if (src && !error) setImgLoaded(true); else setImgLoaded(false); }, [src, error, setImgLoaded]);
    if (!src || error) return null;
    return (
        <Image
            src={src}
            alt={alt ?? ""}
            fill
            sizes="48px"
            onError={() => { setError(true); setImgLoaded(false); }}
            className={cn("object-cover", className)}
            unoptimized
        />
    );
}

export function AvatarFallback({ children, className }: { children: React.ReactNode; className?: string }) {
    const { imgLoaded } = React.useContext(AvatarContext);
    if (imgLoaded) return null;
    return (
        <div className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium", className)}>
            {children}
        </div>
    );
}
