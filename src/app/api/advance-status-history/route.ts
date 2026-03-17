import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("advance_status_history");

export const { GET, POST } = createCollectionRoute(config);
