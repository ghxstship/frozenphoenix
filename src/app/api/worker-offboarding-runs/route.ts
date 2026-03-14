import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("worker_offboarding_run");

export const { GET, POST } = createCollectionRoute(config);
