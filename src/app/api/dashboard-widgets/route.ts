import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("dashboard_widget");

export const { GET, POST } = createCollectionRoute(config);
