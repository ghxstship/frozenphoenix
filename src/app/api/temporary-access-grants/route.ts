import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("temporary_access_grant");

export const { GET, POST } = createCollectionRoute(config);
