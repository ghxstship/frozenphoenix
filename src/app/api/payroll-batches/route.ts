import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("payroll_batch");

export const { GET, POST } = createCollectionRoute(config);
