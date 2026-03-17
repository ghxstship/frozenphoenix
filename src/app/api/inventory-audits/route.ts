import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("inventory_audit");

export const { GET, POST } = createCollectionRoute(config);
