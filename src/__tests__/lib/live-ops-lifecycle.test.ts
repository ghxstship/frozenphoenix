import { describe, expect, it } from "vitest";
import {
    getMachineForEntity,
    LIVE_EVENT_MACHINE,
    READINESS_GATE_MACHINE,
    ROS_CUE_MACHINE,
} from "@/lib/state-machines";
import { isTerminalState, validateTransition } from "@/lib/state-machine";
import type { TransitionContext } from "@/lib/state-machine";

const PM: TransitionContext = { userRole: "pm" };
const EXEC: TransitionContext = { userRole: "exec" };
const MEMBER: TransitionContext = { userRole: "member" };

describe("Live Event State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("live_event")).toBe(LIVE_EVENT_MACHINE);
    });
    it("has 12 states", () => {
        expect(LIVE_EVENT_MACHINE.states).toHaveLength(12);
    });
    it("wrapped is terminal", () => {
        expect(isTerminalState(LIVE_EVENT_MACHINE, "wrapped")).toBe(true);
    });
    it("full lifecycle: planning→pre_production→advancing→load_in→rehearsal→show_ready→live→strike→load_out→reconciliation→wrapped", () => {
        const path = [
            "planning",
            "pre_production",
            "advancing",
            "load_in",
            "rehearsal",
            "show_ready",
            "live",
            "strike",
            "load_out",
            "reconciliation",
            "wrapped",
        ] as const;
        for (let i = 0; i < path.length - 1; i++) {
            expect(validateTransition(LIVE_EVENT_MACHINE, path[i]!, path[i + 1]!, PM).allowed).toBe(
                true
            );
        }
    });
    it("intermission: live→intermission→live", () => {
        expect(validateTransition(LIVE_EVENT_MACHINE, "live", "intermission", PM).allowed).toBe(
            true
        );
        expect(validateTransition(LIVE_EVENT_MACHINE, "intermission", "live", PM).allowed).toBe(
            true
        );
    });
    it("go live triggers activateCommandDashboard", () => {
        const r = validateTransition(LIVE_EVENT_MACHINE, "show_ready", "live", PM);
        expect(r.sideEffects).toContain("activateCommandDashboard");
    });
    it("wrapped triggers generateReconciliationReport", () => {
        const r = validateTransition(LIVE_EVENT_MACHINE, "reconciliation", "wrapped", PM);
        expect(r.sideEffects).toContain("generateReconciliationReport");
    });
    it("member cannot advance event state", () => {
        expect(
            validateTransition(LIVE_EVENT_MACHINE, "planning", "pre_production", MEMBER).allowed
        ).toBe(false);
    });
});

describe("ROS Cue State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("ros_cue")).toBe(ROS_CUE_MACHINE);
    });
    it("has 7 states", () => {
        expect(ROS_CUE_MACHINE.states).toHaveLength(7);
    });
    it("completed and skipped are terminal", () => {
        expect(isTerminalState(ROS_CUE_MACHINE, "completed")).toBe(true);
        expect(isTerminalState(ROS_CUE_MACHINE, "skipped")).toBe(true);
    });
    it("happy path: standby→warned→go→executing→completed", () => {
        const path = ["standby", "warned", "go", "executing", "completed"] as const;
        for (let i = 0; i < path.length - 1; i++) {
            expect(
                validateTransition(ROS_CUE_MACHINE, path[i]!, path[i + 1]!, MEMBER).allowed
            ).toBe(true);
        }
    });
    it("skip from standby or warned", () => {
        expect(validateTransition(ROS_CUE_MACHINE, "standby", "skipped", PM).allowed).toBe(true);
        expect(validateTransition(ROS_CUE_MACHINE, "warned", "skipped", PM).allowed).toBe(true);
    });
    it("hold from standby/warned/go", () => {
        expect(validateTransition(ROS_CUE_MACHINE, "standby", "held", PM).allowed).toBe(true);
        expect(validateTransition(ROS_CUE_MACHINE, "warned", "held", PM).allowed).toBe(true);
        expect(validateTransition(ROS_CUE_MACHINE, "go", "held", PM).allowed).toBe(true);
    });
    it("release hold: held→standby", () => {
        expect(validateTransition(ROS_CUE_MACHINE, "held", "standby", PM).allowed).toBe(true);
    });
    it("go triggers postToChannel", () => {
        const r = validateTransition(ROS_CUE_MACHINE, "warned", "go", MEMBER);
        expect(r.sideEffects).toContain("postToChannel");
    });
    it("member cannot skip (PM+ only)", () => {
        expect(validateTransition(ROS_CUE_MACHINE, "standby", "skipped", MEMBER).allowed).toBe(
            false
        );
    });
});

describe("Readiness Gate State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("readiness_gate")).toBe(READINESS_GATE_MACHINE);
    });
    it("has 5 states", () => {
        expect(READINESS_GATE_MACHINE.states).toHaveLength(5);
    });
    it("passed and waived are terminal", () => {
        expect(isTerminalState(READINESS_GATE_MACHINE, "passed")).toBe(true);
        expect(isTerminalState(READINESS_GATE_MACHINE, "waived")).toBe(true);
    });
    it("happy path: not_started→in_progress→passed", () => {
        expect(
            validateTransition(READINESS_GATE_MACHINE, "not_started", "in_progress", MEMBER).allowed
        ).toBe(true);
        expect(
            validateTransition(READINESS_GATE_MACHINE, "in_progress", "passed", PM).allowed
        ).toBe(true);
    });
    it("failure→recheck: failed→in_progress", () => {
        expect(
            validateTransition(READINESS_GATE_MACHINE, "in_progress", "failed", PM).allowed
        ).toBe(true);
        expect(
            validateTransition(READINESS_GATE_MACHINE, "failed", "in_progress", PM).allowed
        ).toBe(true);
    });
    it("waive from failed or not_started (exec/director only)", () => {
        expect(validateTransition(READINESS_GATE_MACHINE, "failed", "waived", EXEC).allowed).toBe(
            true
        );
        expect(
            validateTransition(READINESS_GATE_MACHINE, "not_started", "waived", EXEC).allowed
        ).toBe(true);
        expect(validateTransition(READINESS_GATE_MACHINE, "failed", "waived", PM).allowed).toBe(
            false
        );
    });
});

describe("E2E: Live Event Full Lifecycle", () => {
    it("Scenario: Full event with cues and gates", () => {
        // Event advances through phases
        expect(
            validateTransition(LIVE_EVENT_MACHINE, "planning", "pre_production", PM).allowed
        ).toBe(true);
        expect(
            validateTransition(LIVE_EVENT_MACHINE, "pre_production", "advancing", PM).allowed
        ).toBe(true);
        expect(validateTransition(LIVE_EVENT_MACHINE, "advancing", "load_in", PM).allowed).toBe(
            true
        );
        expect(validateTransition(LIVE_EVENT_MACHINE, "load_in", "rehearsal", PM).allowed).toBe(
            true
        );
        // Readiness gates pass
        expect(
            validateTransition(READINESS_GATE_MACHINE, "not_started", "in_progress", MEMBER).allowed
        ).toBe(true);
        expect(
            validateTransition(READINESS_GATE_MACHINE, "in_progress", "passed", PM).allowed
        ).toBe(true);
        // Show goes live
        expect(validateTransition(LIVE_EVENT_MACHINE, "rehearsal", "show_ready", PM).allowed).toBe(
            true
        );
        expect(validateTransition(LIVE_EVENT_MACHINE, "show_ready", "live", PM).allowed).toBe(true);
        // Cues execute
        expect(validateTransition(ROS_CUE_MACHINE, "standby", "warned", MEMBER).allowed).toBe(true);
        expect(validateTransition(ROS_CUE_MACHINE, "warned", "go", MEMBER).allowed).toBe(true);
        expect(validateTransition(ROS_CUE_MACHINE, "go", "executing", MEMBER).allowed).toBe(true);
        expect(validateTransition(ROS_CUE_MACHINE, "executing", "completed", MEMBER).allowed).toBe(
            true
        );
        // Strike and reconciliation
        expect(validateTransition(LIVE_EVENT_MACHINE, "live", "strike", PM).allowed).toBe(true);
        expect(validateTransition(LIVE_EVENT_MACHINE, "strike", "load_out", PM).allowed).toBe(true);
        expect(
            validateTransition(LIVE_EVENT_MACHINE, "load_out", "reconciliation", PM).allowed
        ).toBe(true);
        expect(
            validateTransition(LIVE_EVENT_MACHINE, "reconciliation", "wrapped", PM).allowed
        ).toBe(true);
    });
});
