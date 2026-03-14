import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("login_audit_log");

export const { GET, POST } = createCollectionRoute(config);
