import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("time_tracking_policy");

export const { GET, POST } = createCollectionRoute(config);
