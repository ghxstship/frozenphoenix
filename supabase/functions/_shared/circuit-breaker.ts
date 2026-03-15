/**
 * H-016: Circuit Breaker for external provider API calls.
 *
 * Prevents cascading failures when an external provider (Square, Eventbrite, etc.)
 * is down by tracking failures and short-circuiting calls after a threshold.
 *
 * States:
 *   CLOSED  → Normal operation. Calls pass through.
 *   OPEN    → Provider is down. Calls are immediately rejected.
 *   HALF_OPEN → After a cooldown, allows one probe call to test recovery.
 *
 * This is an in-memory implementation scoped to a single edge function invocation
 * lifetime. For cross-invocation state, persist to provider_connections.error_count.
 */

export type CircuitState = "closed" | "open" | "half_open";

export interface CircuitBreakerOptions {
    /** Number of consecutive failures before opening the circuit. Default: 5. */
    failureThreshold?: number;
    /** Milliseconds to wait before transitioning from open → half_open. Default: 30_000. */
    cooldownMs?: number;
    /** Name for logging. */
    name?: string;
}

export class CircuitBreaker {
    private state: CircuitState = "closed";
    private failureCount = 0;
    private lastFailureTime = 0;
    private readonly failureThreshold: number;
    private readonly cooldownMs: number;
    readonly name: string;

    constructor(options: CircuitBreakerOptions = {}) {
        this.failureThreshold = options.failureThreshold ?? 5;
        this.cooldownMs = options.cooldownMs ?? 30_000;
        this.name = options.name ?? "default";
    }

    /**
     * Execute an async operation with circuit breaker protection.
     * Throws `CircuitOpenError` if the circuit is open.
     */
    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === "open") {
            if (Date.now() - this.lastFailureTime >= this.cooldownMs) {
                this.state = "half_open";
            } else {
                throw new CircuitOpenError(this.name);
            }
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (err) {
            this.onFailure();
            throw err;
        }
    }

    private onSuccess(): void {
        this.failureCount = 0;
        this.state = "closed";
    }

    private onFailure(): void {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.failureCount >= this.failureThreshold) {
            this.state = "open";
        }
    }

    getState(): CircuitState {
        return this.state;
    }

    getFailureCount(): number {
        return this.failureCount;
    }
}

export class CircuitOpenError extends Error {
    constructor(circuitName: string) {
        super(`Circuit breaker "${circuitName}" is OPEN — external provider unavailable`);
        this.name = "CircuitOpenError";
    }
}
