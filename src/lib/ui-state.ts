/* ═══════════════════════════════════════════════════════════════
   UI STATE MACHINE LIBRARY — Deterministic UI State Modeling
   ═══════════════════════════════════════════════════════════════
   
   Every UI surface must be in exactly one known state.
   No implicit states. No ambiguous transitions.
   No untracked visual drift.
   
   3NF Compliance:
   - State defined once, consumed by all components
   - No duplicated loading/error/empty logic
   ═══════════════════════════════════════════════════════════════ */

// ─── Data State Machine ───
// Represents the lifecycle of any async data fetch

export type DataState<T> =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; data: T }
    | { status: "error"; error: string; retryable?: boolean }
    | { status: "empty"; message?: string }
    | { status: "refreshing"; data: T }
    | { status: "stale"; data: T };

export function isLoading<T>(state: DataState<T>): boolean {
    return state.status === "loading";
}

export function isSuccess<T>(state: DataState<T>): state is { status: "success"; data: T } {
    return state.status === "success";
}

export function isError<T>(state: DataState<T>): state is { status: "error"; error: string } {
    return state.status === "error";
}

export function isEmpty<T>(state: DataState<T>): boolean {
    return state.status === "empty";
}

export function hasData<T>(
    state: DataState<T>
): state is
    | { status: "success"; data: T }
    | { status: "refreshing"; data: T }
    | { status: "stale"; data: T } {
    return state.status === "success" || state.status === "refreshing" || state.status === "stale";
}

export function getData<T>(state: DataState<T>): T | undefined {
    if (hasData(state)) return state.data;
    return undefined;
}

// ─── Permission State ───
// Represents what the current user can do

export type PermissionState =
    | { granted: true }
    | {
          granted: false;
          reason: "unauthenticated" | "unauthorized" | "forbidden" | "feature_disabled";
      };

export function isGranted(state: PermissionState): state is { granted: true } {
    return state.granted;
}

// ─── Form State Machine ───
// Represents the lifecycle of a form submission

export type FormState =
    | { status: "idle" }
    | { status: "dirty"; changedFields: string[] }
    | { status: "validating" }
    | { status: "invalid"; errors: Record<string, string> }
    | { status: "submitting" }
    | { status: "submitted"; message?: string }
    | { status: "error"; error: string };

export function isSubmitting(state: FormState): boolean {
    return state.status === "submitting";
}

export function isFormValid(state: FormState): boolean {
    return state.status !== "invalid" && state.status !== "validating";
}

// ─── Component Visual State ───
// Standard visual states for interactive components

export type VisualState =
    | "default"
    | "hover"
    | "focus"
    | "active"
    | "pressed"
    | "disabled"
    | "loading"
    | "error"
    | "success"
    | "warning"
    | "selected";

// ─── Async Operation State ───
// For tracking individual async operations (save, delete, etc.)

export type AsyncState =
    | { status: "idle" }
    | { status: "pending" }
    | { status: "fulfilled"; result?: unknown }
    | { status: "rejected"; error: string };

export function isPending(state: AsyncState): boolean {
    return state.status === "pending";
}

// ─── Page State Compositor ───
// Combines data + permission + form states into a page-level state

export interface PageState<T> {
    data: DataState<T>;
    permission: PermissionState;
    connection: "online" | "offline" | "reconnecting";
}

export function createPageState<T>(overrides?: Partial<PageState<T>>): PageState<T> {
    return {
        data: { status: "idle" },
        permission: { granted: true },
        connection: "online",
        ...overrides,
    };
}

// ─── Transition Helpers ───
// Type-safe state transition functions

export function toLoading<T>(): DataState<T> {
    return { status: "loading" };
}

export function toSuccess<T>(data: T): DataState<T> {
    return { status: "success", data };
}

export function toError<T>(error: string, retryable = true): DataState<T> {
    return { status: "error", error, retryable };
}

export function toEmpty<T>(message?: string): DataState<T> {
    return { status: "empty", ...(message ? { message } : {}) } as DataState<T>;
}

export function toRefreshing<T>(data: T): DataState<T> {
    return { status: "refreshing", data };
}
