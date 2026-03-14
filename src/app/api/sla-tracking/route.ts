import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("sla_tracking");

export const { GET, POST } = createCollectionRoute(config);
