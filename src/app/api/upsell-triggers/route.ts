import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("upsell_trigger");

export const { GET, POST } = createCollectionRoute(config);
