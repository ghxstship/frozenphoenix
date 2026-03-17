import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("live_financial_snapshot");

export const { GET, POST } = createCollectionRoute(config);
