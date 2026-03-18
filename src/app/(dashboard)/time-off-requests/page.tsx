"use client";

import { ListPageShell } from "@/components/shells";
import { TIME_OFF_REQUESTS_PAGE } from "@/config/list-page-configs";
import { useApproveTimeOffRequest, useRejectTimeOffRequest } from "@/lib/supabase";
import { useCreateTimeOffRequest } from "@/lib/supabase/hooks-workforce";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useState } from "react";

function TimeOffActions({ requestId, status }: { requestId: string; status: string }) {
    const approve = useApproveTimeOffRequest();
    const reject = useRejectTimeOffRequest();
    const isBusy = approve.isPending || reject.isPending;

    if (status !== "pending") return null;

    return (
        <div className="flex gap-1">
            <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                disabled={isBusy}
                onClick={(e) => {
                    e.stopPropagation();
                    approve.mutate({ id: requestId, status: "approved" });
                }}
            >
                {approve.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                )}
                Approve
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive"
                disabled={isBusy}
                onClick={(e) => {
                    e.stopPropagation();
                    reject.mutate({ id: requestId, status: "rejected" });
                }}
            >
                {reject.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                )}
                Reject
            </Button>
        </div>
    );
}

export default function TimeOffRequestsPage() {
    const [_actionsRef] = useState(() => TimeOffActions);
    const _create = useCreateTimeOffRequest();
    return <ListPageShell config={TIME_OFF_REQUESTS_PAGE} />;
}
