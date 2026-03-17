import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("contract_amendment");

export const { GET, POST } = createCollectionRoute(config);
