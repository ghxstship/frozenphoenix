import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("vip_service_request");

export const { GET, POST } = createCollectionRoute(config);
