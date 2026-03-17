import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("pos_transaction");

export const { GET, POST } = createCollectionRoute(config);
