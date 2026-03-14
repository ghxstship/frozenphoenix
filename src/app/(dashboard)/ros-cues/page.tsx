"use client";

import { ListPageShell } from "@/components/shells";
import { ROS_CUES_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={ROS_CUES_PAGE} />;
}
