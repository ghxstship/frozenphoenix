"use client";

import * as React from "react";
import { useMotion } from "@/hooks/use-motion";

interface NumberTickerProps {
    value: number;
    duration?: number | undefined;
    formatFn?: ((value: number) => string) | undefined;
    className?: string | undefined;
}

export function NumberTicker({ value, duration = 600, formatFn, className }: NumberTickerProps) {
    const { shouldAnimate } = useMotion();
    const [displayValue, setDisplayValue] = React.useState(shouldAnimate ? 0 : value);
    const previousValueRef = React.useRef(value);
    const rafRef = React.useRef<number>(0);

    React.useEffect(() => {
        if (!shouldAnimate) {
            setDisplayValue(value);
            return;
        }

        const startValue = previousValueRef.current;
        const endValue = value;
        previousValueRef.current = value;

        if (startValue === endValue) return;

        const startTime = performance.now();

        const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (endValue - startValue) * eased;

            setDisplayValue(current);

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                setDisplayValue(endValue);
            }
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [value, duration, shouldAnimate]);

    const formatted = formatFn
        ? formatFn(displayValue)
        : Number.isInteger(value)
          ? Math.round(displayValue).toLocaleString()
          : displayValue.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
            });

    return (
        <span className={className} aria-live="polite" aria-atomic="true">
            {formatted}
        </span>
    );
}
