/* ═══════════════════════════════════════════════════════════════
   STRUCTURED LOGGER — FIND-037 Remediation
   ═══════════════════════════════════════════════════════════════
   
   Lightweight structured logging abstraction. In production, logs
   are JSON for log aggregator compatibility. In development, logs
   are human-readable with color.
   
   Usage:
     import { logger } from "@/lib/logger";
     logger.info("User created", { userId: "abc" });
     logger.error("DB query failed", { table: "profiles", err });
   
   Request-scoped logging:
     const log = logger.child({ requestId: "req_123" });
     log.info("Processing request");
   ═══════════════════════════════════════════════════════════════ */

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
    level: LogLevel;
    msg: string;
    timestamp: string;
    [key: string]: unknown;
}

type LogContext = Record<string, unknown>;

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
};

function getMinLevel(): LogLevel {
    if (typeof process !== "undefined" && process.env.LOG_LEVEL) {
        const env = process.env.LOG_LEVEL as LogLevel;
        if (env in LOG_LEVELS) return env;
    }
    if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
        return "warn";
    }
    return "debug";
}

function shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[getMinLevel()];
}

function formatEntry(entry: LogEntry): string {
    const isProd =
        typeof process !== "undefined" && process.env.NODE_ENV === "production";

    if (isProd) {
        return JSON.stringify(entry);
    }

    // Human-readable for development
    const color: Record<LogLevel, string> = {
        debug: "\x1b[36m", // cyan
        info: "\x1b[32m",  // green
        warn: "\x1b[33m",  // yellow
        error: "\x1b[31m", // red
    };
    const reset = "\x1b[0m";
    const { level, msg, timestamp: _, ...rest } = entry;
    void _;
    const ctx = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : "";
    return `${color[level]}[${level.toUpperCase()}]${reset} ${msg}${ctx}`;
}

function emit(level: LogLevel, entry: LogEntry): void {
    const formatted = formatEntry(entry);
    switch (level) {
        case "error":
            console.error(formatted);
            break;
        case "warn":
            console.warn(formatted);
            break;
        default:
            console.log(formatted);
    }
}

function createLogger(baseContext: LogContext = {}) {
    function log(level: LogLevel, msg: string, context?: LogContext): void {
        if (!shouldLog(level)) return;
        const entry: LogEntry = {
            level,
            msg,
            timestamp: new Date().toISOString(),
            ...baseContext,
            ...context,
        };
        emit(level, entry);
    }

    return {
        debug: (msg: string, ctx?: LogContext) => log("debug", msg, ctx),
        info: (msg: string, ctx?: LogContext) => log("info", msg, ctx),
        warn: (msg: string, ctx?: LogContext) => log("warn", msg, ctx),
        error: (msg: string, ctx?: LogContext) => log("error", msg, ctx),

        /**
         * Create a child logger with additional context fields.
         * Useful for request-scoped logging (e.g., requestId).
         */
        child: (childContext: LogContext) =>
            createLogger({ ...baseContext, ...childContext }),
    };
}

export const logger = createLogger();
