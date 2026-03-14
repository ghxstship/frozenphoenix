import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("production_time_entry");

export const { GET, POST } = createCollectionRoute(config);
