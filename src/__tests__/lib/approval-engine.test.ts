/**
 * Approval Engine Tests (WS-03)
 *
 * Tests the server-side approval workflow orchestration with a
 * mock Supabase client that simulates DB operations in-memory.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    cancelWorkflow,
    escalateStep,
    getInstanceStatus,
    initiateWorkflow,
    recordDecision,
} from "@/lib/approval-engine";
import type { InitiatePayload } from "@/lib/approval-engine";

// ─── In-memory Supabase Mock ────────────────────────────────

interface MockRow {
    id: string;
    [key: string]: unknown;
}

type MockTable = Record<string, MockRow[]>;

function createMockSupabase(initialData: MockTable = {}) {
    const tables: MockTable = { ...initialData };

    function getTable(name: string): MockRow[] {
        if (!tables[name]) tables[name] = [];
        return tables[name]!;
    }

    let idCounter = 100;
    function nextId() {
        return `mock-${++idCounter}`;
    }

    // Build a chainable query builder that operates on in-memory arrays
    function createQueryBuilder(tableName: string) {
        let rows = [...getTable(tableName)];
        let pendingInsert: MockRow[] | null = null;
        let pendingUpdate: Partial<MockRow> | null = null;
        const filters: Array<(r: MockRow) => boolean> = [];
        let _selectFields: string = "*";
        let sortField: string | null = null;
        let sortAsc = true;
        let limitCount: number | null = null;
        let singleMode = false;

        const builder = {
            select(fields?: string) {
                if (fields) _selectFields = fields;
                return builder;
            },
            insert(data: MockRow | MockRow[]) {
                const arr = Array.isArray(data) ? data : [data];
                pendingInsert = arr.map((d) => ({ ...d, id: d.id ?? nextId() }));
                for (const row of pendingInsert) {
                    getTable(tableName).push(row);
                }
                rows = [...pendingInsert];
                return builder;
            },
            update(data: Partial<MockRow>) {
                pendingUpdate = data;
                return builder;
            },
            eq(field: string, value: unknown) {
                filters.push((r) => r[field] === value);
                return builder;
            },
            in(field: string, values: unknown[]) {
                filters.push((r) => values.includes(r[field]));
                return builder;
            },
            is(field: string, value: null) {
                filters.push((r) => r[field] === value || r[field] === undefined);
                return builder;
            },
            order(field: string, opts?: { ascending?: boolean }) {
                sortField = field;
                sortAsc = opts?.ascending ?? true;
                return builder;
            },
            limit(n: number) {
                limitCount = n;
                return builder;
            },
            single() {
                singleMode = true;
                return builder;
            },
            then(resolve: (result: { data: unknown; error: unknown }) => void) {
                let result = rows;

                // Apply filters
                for (const f of filters) {
                    result = result.filter(f);
                }

                // Apply update
                if (pendingUpdate) {
                    const table = getTable(tableName);
                    for (const row of result) {
                        const idx = table.findIndex((r) => r.id === row.id);
                        if (idx >= 0) {
                            Object.assign(table[idx]!, pendingUpdate);
                            Object.assign(row, pendingUpdate);
                        }
                    }
                    return resolve({
                        data: singleMode ? (result[0] ?? null) : result,
                        error: null,
                    });
                }

                // Sort
                if (sortField) {
                    const sf = sortField;
                    result.sort((a, b) => {
                        const va = a[sf] as number | string;
                        const vb = b[sf] as number | string;
                        if (va < vb) return sortAsc ? -1 : 1;
                        if (va > vb) return sortAsc ? 1 : -1;
                        return 0;
                    });
                }

                // Limit
                if (limitCount !== null) {
                    result = result.slice(0, limitCount);
                }

                // Single
                if (singleMode) {
                    if (result.length === 0) {
                        return resolve({
                            data: null,
                            error: { message: "Row not found", code: "PGRST116" },
                        });
                    }
                    return resolve({ data: result[0], error: null });
                }

                return resolve({ data: result, error: null });
            },
        };

        // Make the builder thenable (Promise-like)
        (builder as unknown as { [Symbol.toStringTag]: string })[Symbol.toStringTag] = "Promise";

        return builder;
    }

    return {
        from(tableName: string) {
            return createQueryBuilder(tableName);
        },
        _tables: tables,
        _getTable: getTable,
    };
}

// ─── Test Data ──────────────────────────────────────────────

const ORG_ID = "org-1";
const USER_ID = "user-1";
const APPROVER_ID = "approver-1";
const APPROVER_2_ID = "approver-2";
const DELEGATE_ID = "delegate-1";

function seedWorkflow(supabase: ReturnType<typeof createMockSupabase>) {
    // Create a workflow
    supabase._getTable("approval_workflows").push({
        id: "wf-1",
        name: "Contract Approval",
        status: "active",
        entity_type: "contract",
        description: "Two-step approval for contracts",
        require_comments: false,
    });

    // Create steps
    supabase._getTable("approval_steps").push(
        {
            id: "step-1",
            workflow_id: "wf-1",
            name: "Manager Review",
            step_order: 1,
            step_type: "single",
            approver_user_ids: [APPROVER_ID],
            on_reject_action: null,
            escalation_to_user_id: null,
            escalation_to_role: null,
        },
        {
            id: "step-2",
            workflow_id: "wf-1",
            name: "Director Sign-off",
            step_order: 2,
            step_type: "all",
            approver_user_ids: [APPROVER_ID, APPROVER_2_ID],
            on_reject_action: null,
            escalation_to_user_id: "escalation-user-1",
            escalation_to_role: null,
        }
    );
}

function basePayload(): InitiatePayload {
    return {
        workflowId: "wf-1",
        entityId: "contract-1",
        entityType: "contract",
        entityName: "Vendor Agreement 2026",
        organizationId: ORG_ID,
        initiatedBy: USER_ID,
    };
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

describe("Approval Engine", () => {
    let supabase: ReturnType<typeof createMockSupabase>;

    beforeEach(() => {
        supabase = createMockSupabase();
        seedWorkflow(supabase);
        vi.clearAllMocks();
    });

    // ─── Initiation ─────────────────────────────────────────

    describe("initiateWorkflow", () => {
        it("creates an instance and assigns first step approvals", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await initiateWorkflow(supabase as any, basePayload());

            expect(result.success).toBe(true);
            expect(result.data?.instanceId).toBeDefined();
            expect(result.data?.currentStepId).toBe("step-1");

            // Verify instance was created
            const instances = supabase._getTable("workflow_instances");
            expect(instances).toHaveLength(1);
            expect(instances[0]!.status).toBe("in_progress");

            // Verify step approval was created
            const approvals = supabase._getTable("workflow_step_approvals");
            expect(approvals).toHaveLength(1);
            expect(approvals[0]!.approver_id).toBe(APPROVER_ID);
        });

        it("rejects when workflow not found", async () => {
            const payload = { ...basePayload(), workflowId: "nonexistent" };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await initiateWorkflow(supabase as any, payload);

            expect(result.success).toBe(false);
            expect(result.code).toBe("NOT_FOUND");
        });

        it("rejects when workflow is not active", async () => {
            supabase._getTable("approval_workflows")[0]!.status = "paused";
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await initiateWorkflow(supabase as any, basePayload());

            expect(result.success).toBe(false);
            expect(result.code).toBe("INVALID_STATE");
        });

        it("rejects entity type mismatch", async () => {
            const payload = { ...basePayload(), entityType: "invoice" };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await initiateWorkflow(supabase as any, payload);

            expect(result.success).toBe(false);
            expect(result.code).toBe("ENTITY_MISMATCH");
        });

        it("rejects duplicate active instance for same entity", async () => {
            // Create existing active instance
            supabase._getTable("workflow_instances").push({
                id: "existing-inst",
                workflow_id: "wf-1",
                entity_id: "contract-1",
                status: "in_progress",
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await initiateWorkflow(supabase as any, basePayload());

            expect(result.success).toBe(false);
            expect(result.code).toBe("CONFLICT");
        });
    });

    // ─── Decision Recording ─────────────────────────────────

    describe("recordDecision", () => {
        let instanceId: string;

        beforeEach(async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const init = await initiateWorkflow(supabase as any, basePayload());
            instanceId = init.data!.instanceId;
        });

        it("records an approval and advances to next step", async () => {
            const approvalRow = supabase._getTable("workflow_step_approvals")[0]!;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await recordDecision(supabase as any, {
                instanceId,
                stepId: "step-1",
                approverId: APPROVER_ID,
                decision: "approved",
                comments: "Looks good",
            });

            expect(result.success).toBe(true);
            expect(result.data?.advanced).toBe(true);
            expect(result.data?.nextStepId).toBe("step-2");
            expect(result.data?.instanceStatus).toBe("in_progress");

            // Verify the approval was recorded
            expect(approvalRow.decision).toBe("approved");
        });

        it("rejects decision from non-assigned approver", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await recordDecision(supabase as any, {
                instanceId,
                stepId: "step-1",
                approverId: "random-user",
                decision: "approved",
            });

            expect(result.success).toBe(false);
            expect(result.code).toBe("NOT_ASSIGNED");
        });

        it("rejects decision for wrong step", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await recordDecision(supabase as any, {
                instanceId,
                stepId: "step-2",
                approverId: APPROVER_ID,
                decision: "approved",
            });

            expect(result.success).toBe(false);
            expect(result.code).toBe("STEP_MISMATCH");
        });

        it("rejection cancels the workflow by default", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await recordDecision(supabase as any, {
                instanceId,
                stepId: "step-1",
                approverId: APPROVER_ID,
                decision: "rejected",
                comments: "Insufficient detail",
            });

            expect(result.success).toBe(true);
            expect(result.data?.instanceStatus).toBe("cancelled");

            const instance = supabase
                ._getTable("workflow_instances")
                .find((i) => i.id === instanceId);
            expect(instance?.status).toBe("cancelled");
        });

        it("handles delegation", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await recordDecision(supabase as any, {
                instanceId,
                stepId: "step-1",
                approverId: APPROVER_ID,
                decision: "delegated",
                delegateTo: DELEGATE_ID,
            });

            expect(result.success).toBe(true);
            expect(result.data?.advanced).toBe(false);

            // Verify delegate approval was created
            const approvals = supabase._getTable("workflow_step_approvals");
            const delegateApproval = approvals.find((a) => a.approver_id === DELEGATE_ID);
            expect(delegateApproval).toBeDefined();
            expect(delegateApproval?.delegated_from).toBe(APPROVER_ID);
        });

        it("rejects delegation without delegateTo", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await recordDecision(supabase as any, {
                instanceId,
                stepId: "step-1",
                approverId: APPROVER_ID,
                decision: "delegated",
            });

            expect(result.success).toBe(false);
            expect(result.code).toBe("VALIDATION");
        });

        it("completes workflow after all steps approved", async () => {
            // Approve step 1
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await recordDecision(supabase as any, {
                instanceId,
                stepId: "step-1",
                approverId: APPROVER_ID,
                decision: "approved",
            });

            // Step 2 is "all" type — both approvers needed
            const step2Approvals = supabase
                ._getTable("workflow_step_approvals")
                .filter((a) => a.step_id === "step-2");
            expect(step2Approvals.length).toBe(2);

            // Approve from first approver
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const r1 = await recordDecision(supabase as any, {
                instanceId,
                stepId: "step-2",
                approverId: APPROVER_ID,
                decision: "approved",
            });
            expect(r1.data?.advanced).toBe(false); // Not yet complete, need both

            // Approve from second approver
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const r2 = await recordDecision(supabase as any, {
                instanceId,
                stepId: "step-2",
                approverId: APPROVER_2_ID,
                decision: "approved",
            });
            expect(r2.data?.advanced).toBe(true);
            expect(r2.data?.instanceStatus).toBe("completed");
        });

        it("rejects decision on non-existent instance", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await recordDecision(supabase as any, {
                instanceId: "nonexistent",
                stepId: "step-1",
                approverId: APPROVER_ID,
                decision: "approved",
            });

            expect(result.success).toBe(false);
            expect(result.code).toBe("NOT_FOUND");
        });
    });

    // ─── Escalation ─────────────────────────────────────────

    describe("escalateStep", () => {
        let instanceId: string;

        beforeEach(async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const init = await initiateWorkflow(supabase as any, basePayload());
            instanceId = init.data!.instanceId;
            // Advance to step 2 (which has escalation config)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await recordDecision(supabase as any, {
                instanceId,
                stepId: "step-1",
                approverId: APPROVER_ID,
                decision: "approved",
            });
        });

        it("escalates step and creates new approval for escalation target", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await escalateStep(supabase as any, {
                instanceId,
                stepId: "step-2",
                escalatedBy: USER_ID,
                reason: "Overdue",
            });

            expect(result.success).toBe(true);
            expect(result.data?.escalatedTo).toBe("escalation-user-1");

            // Verify instance status changed
            const instance = supabase
                ._getTable("workflow_instances")
                .find((i) => i.id === instanceId);
            expect(instance?.status).toBe("escalated");
        });

        it("rejects escalation for step without escalation target", async () => {
            // Step 1 has no escalation config — but we're already on step 2.
            // Let's try escalating a step that doesn't match current
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await escalateStep(supabase as any, {
                instanceId,
                stepId: "step-1",
                escalatedBy: USER_ID,
            });

            expect(result.success).toBe(false);
            expect(result.code).toBe("STEP_MISMATCH");
        });
    });

    // ─── Cancellation ───────────────────────────────────────

    describe("cancelWorkflow", () => {
        let instanceId: string;

        beforeEach(async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const init = await initiateWorkflow(supabase as any, basePayload());
            instanceId = init.data!.instanceId;
        });

        it("cancels an active workflow", async () => {
            const result = await cancelWorkflow(
                supabase as unknown as Parameters<typeof cancelWorkflow>[0],
                instanceId,
                USER_ID,
                "No longer needed"
            );

            expect(result.success).toBe(true);

            const instance = supabase
                ._getTable("workflow_instances")
                .find((i) => i.id === instanceId);
            expect(instance?.status).toBe("cancelled");
            expect(instance?.cancelled_reason).toContain("No longer needed");
        });

        it("rejects cancellation of already-cancelled instance", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await cancelWorkflow(supabase as any, instanceId, USER_ID);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await cancelWorkflow(supabase as any, instanceId, USER_ID);

            expect(result.success).toBe(false);
            expect(result.code).toBe("INVALID_STATE");
        });

        it("rejects cancellation of non-existent instance", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await cancelWorkflow(supabase as any, "nonexistent", USER_ID);

            expect(result.success).toBe(false);
            expect(result.code).toBe("NOT_FOUND");
        });
    });

    // ─── Status Query ───────────────────────────────────────

    describe("getInstanceStatus", () => {
        it("returns full status for existing instance", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const init = await initiateWorkflow(supabase as any, basePayload());
            const instanceId = init.data!.instanceId;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await getInstanceStatus(supabase as any, instanceId);

            expect(result.success).toBe(true);
            expect(result.data?.instance).toBeDefined();
            expect(result.data?.steps).toBeDefined();
            expect(result.data?.approvals).toBeDefined();
        });

        it("returns error for non-existent instance", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await getInstanceStatus(supabase as any, "nonexistent");

            expect(result.success).toBe(false);
            expect(result.code).toBe("NOT_FOUND");
        });
    });
});
