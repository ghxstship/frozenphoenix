/**
 * Declarative State Machine Engine
 *
 * Validates lifecycle transitions server-side for any entity.
 * Machines are defined as typed config objects — no imperative code.
 *
 * Usage:
 *   const result = validateTransition(PROJECT_MACHINE, "draft", "active", "pm");
 *   if (!result.allowed) throw new Error(result.reason);
 */

import type { PermissionLevel } from "@/types";

// ─── Core Types ───

export interface StateMachineTransition<TState extends string = string> {
    /** Source state */
    from: TState;
    /** Target state */
    to: TState;
    /** Roles permitted to perform this transition */
    roles?:
        | PermissionLevel[]
        | undefined; /** Named guard condition — resolved at validation time via context */
    guard?: string | undefined; /** Human-readable label for the transition (used in UI) */
    label?: string | undefined; /** Side effects to trigger after successful transition */
    sideEffects?: string[] | undefined;
}

export interface StateMachineDefinition<TState extends string = string> {
    /** Unique identifier for this machine (e.g., "project", "task") */
    name: string;
    /** The initial state for new entities */
    initialState: TState;
    /** All valid states */
    states: readonly TState[];
    /** Terminal states — no outbound transitions allowed */
    terminalStates?: readonly TState[] | undefined; /** All allowed transitions */
    transitions: StateMachineTransition<TState>[];
    /** Global side effects keyed by target state */
    onEnter?:
        | Partial<Record<TState, string[]>>
        | undefined; /** Fields required to be non-null before entering a state */
    requiredFields?: Partial<Record<TState, string[]>> | undefined;
}

export interface TransitionContext {
    /** Current user's role */
    userRole: PermissionLevel;
    /** Entity data for guard evaluation */
    entity?: Record<string, unknown> | undefined;
    /** Named guard evaluators */
    guards?: Record<string, (entity: Record<string, unknown>) => boolean> | undefined;
}

export interface TransitionResult {
    allowed: boolean;
    reason?: string | undefined;
    sideEffects?: string[] | undefined;
    requiredFields?: string[] | undefined;
}

// ─── Validation ───

export function validateTransition<TState extends string>(
    machine: StateMachineDefinition<TState>,
    fromState: TState,
    toState: TState,
    context: TransitionContext
): TransitionResult {
    // Validate states exist
    if (!machine.states.includes(fromState)) {
        return { allowed: false, reason: `Invalid source state: "${fromState}"` };
    }
    if (!machine.states.includes(toState)) {
        return { allowed: false, reason: `Invalid target state: "${toState}"` };
    }

    // Check terminal states — block unless an explicit transition is defined
    if (machine.terminalStates?.includes(fromState)) {
        const hasExplicitTransition = machine.transitions.some(
            (t) => t.from === fromState && t.to === toState
        );
        if (!hasExplicitTransition) {
            return {
                allowed: false,
                reason: `Cannot transition from terminal state "${fromState}"`,
            };
        }
    }

    // No-op transition
    if (fromState === toState) {
        return { allowed: true, sideEffects: [] };
    }

    // Find matching transitions
    const matchingTransitions = machine.transitions.filter(
        (t) => t.from === fromState && t.to === toState
    );

    if (matchingTransitions.length === 0) {
        return {
            allowed: false,
            reason: `No transition defined from "${fromState}" to "${toState}" in ${machine.name}`,
        };
    }

    // Check role authorization — at least one transition must allow the role
    const roleAllowed = matchingTransitions.some((t) => {
        if (!t.roles || t.roles.length === 0) return true; // No role restriction
        return t.roles.includes(context.userRole);
    });

    if (!roleAllowed) {
        return {
            allowed: false,
            reason: `Role "${context.userRole}" is not permitted to transition ${machine.name} from "${fromState}" to "${toState}"`,
        };
    }

    // Find the first transition that passes role + guard checks
    for (const transition of matchingTransitions) {
        // Check role
        if (transition.roles && transition.roles.length > 0) {
            if (!transition.roles.includes(context.userRole)) continue;
        }

        // Check guard
        if (transition.guard && context.guards && context.entity) {
            const guardFn = context.guards[transition.guard];
            if (guardFn && !guardFn(context.entity)) {
                continue; // Guard failed, try next matching transition
            }
        }

        // Check required fields for the target state
        const requiredFields = machine.requiredFields?.[toState] ?? [];
        if (requiredFields.length > 0 && context.entity) {
            const missingFields = requiredFields.filter((field) => {
                const value = context.entity?.[field];
                return value === undefined || value === null || value === "";
            });
            if (missingFields.length > 0) {
                return {
                    allowed: false,
                    reason: `Missing required fields for state "${toState}": ${missingFields.join(", ")}`,
                    requiredFields: missingFields,
                };
            }
        }

        // Transition allowed — collect side effects
        const sideEffects = [
            ...(transition.sideEffects ?? []),
            ...(machine.onEnter?.[toState] ?? []),
        ];

        return { allowed: true, sideEffects };
    }

    // All matching transitions failed guards
    return {
        allowed: false,
        reason: `Guard conditions not met for ${machine.name} transition from "${fromState}" to "${toState}"`,
    };
}

// ─── Helpers ───

/** Get all valid target states from a given state for a role */
export function getAvailableTransitions<TState extends string>(
    machine: StateMachineDefinition<TState>,
    fromState: TState,
    userRole: PermissionLevel
): { to: TState; label: string }[] {
    // Terminal states block unless explicit transitions are defined
    if (machine.terminalStates?.includes(fromState)) {
        const hasExplicit = machine.transitions.some((t) => t.from === fromState);
        if (!hasExplicit) return [];
    }

    const seen = new Set<TState>();
    const results: { to: TState; label: string }[] = [];

    for (const t of machine.transitions) {
        if (t.from !== fromState) continue;
        if (seen.has(t.to)) continue;
        if (t.roles && t.roles.length > 0 && !t.roles.includes(userRole)) continue;

        seen.add(t.to);
        results.push({
            to: t.to,
            label: t.label ?? `Move to ${t.to.replace(/_/g, " ")}`,
        });
    }

    return results;
}

/** Check if a state is terminal */
export function isTerminalState<TState extends string>(
    machine: StateMachineDefinition<TState>,
    state: TState
): boolean {
    return machine.terminalStates?.includes(state) ?? false;
}

/** Factory helper for defining machines with type inference */
export function defineStateMachine<TState extends string>(
    definition: StateMachineDefinition<TState>
): StateMachineDefinition<TState> {
    // Validate: all transition states must be in the states array
    for (const t of definition.transitions) {
        if (!definition.states.includes(t.from)) {
            throw new Error(
                `${definition.name}: transition source "${t.from}" is not in states array`
            );
        }
        if (!definition.states.includes(t.to)) {
            throw new Error(
                `${definition.name}: transition target "${t.to}" is not in states array`
            );
        }
    }

    // Validate: terminal states must be in states array
    if (definition.terminalStates) {
        for (const ts of definition.terminalStates) {
            if (!definition.states.includes(ts)) {
                throw new Error(
                    `${definition.name}: terminal state "${ts}" is not in states array`
                );
            }
        }
    }

    return definition;
}
