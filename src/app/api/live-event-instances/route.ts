import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("live_event_instance");

export const { GET, POST } = createCollectionRoute(config);
