import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("foh_zone_reading");

export const { GET, POST } = createCollectionRoute(config);
