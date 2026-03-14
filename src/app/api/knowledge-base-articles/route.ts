import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("knowledge_base_article");

export const { GET, POST } = createCollectionRoute(config);
