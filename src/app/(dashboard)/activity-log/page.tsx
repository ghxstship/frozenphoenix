"use client";

import { ListPageShell } from "@/components/shells";
import { ACTIVITY_LOG_PAGE } from "@/config/list-page-configs";
import {
    useActivityLog,
    useActivityLogRecent,
    useCreateActivity,
    useUpdateActivity,
} from "@/lib/supabase/hooks-admin";

export default function Page() {
    const { data: _activityLog } = useActivityLog();
    const { data: _recentActivity } = useActivityLogRecent();
    const _createActivity = useCreateActivity();
    const _updateActivity = useUpdateActivity();
    return <ListPageShell config={ACTIVITY_LOG_PAGE} />;
}
