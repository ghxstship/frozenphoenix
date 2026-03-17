import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("revenue_recognition_entry");

export const { GET, POST } = createCollectionRoute(config);
