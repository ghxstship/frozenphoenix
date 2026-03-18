import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("post_event_report");

export const { GET, PATCH, DELETE } = createItemRoute(config);
