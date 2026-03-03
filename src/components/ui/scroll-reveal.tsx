"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SCROLL_REVEAL } from "@/config/design-tokens";
import { useReducedMotion } from "@/hooks/use-media-query";

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
    animation?: "fade-up" | "fade-in" | "slide-right" | "scale-in";
    threshold?: number;
    rootMargin?: string;
    delay?: number;
    once?: boolean;
}

export function ScrollReveal({
    animation = "fade-up",
    threshold = SCROLL_REVEAL.threshold,
    rootMargin = SCROLL_REVEAL.rootMargin,
    delay = 0,
    once = true,
    className,
    children,
    ...props
}: ScrollRevealProps) {
    const ref = React.useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = React.useState(false);
    const reducedMotion = useReducedMotion();

    React.useEffect(() => {
        if (reducedMotion) {
            setIsVisible(true);
            return;
        }

        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    setIsVisible(true);
                    if (once) observer.unobserve(el);
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold, rootMargin, once, reducedMotion]);

    const animationClasses = {
        "fade-up": isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        "fade-in": isVisible ? "opacity-100" : "opacity-0",
        "slide-right": isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
        "scale-in": isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
    };

    return (
        <div
            ref={ref}
            className={cn(
                "motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out",
                animationClasses[animation],
                className
            )}
            style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
            {...props}
        >
            {children}
        </div>
    );
}
