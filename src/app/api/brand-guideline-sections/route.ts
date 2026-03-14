import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("brand_guideline_section");

export const { GET, POST } = createCollectionRoute(config);
