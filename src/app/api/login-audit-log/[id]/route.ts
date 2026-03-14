import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("login_audit_log");

export const { GET, PATCH, DELETE } = createItemRoute(config);
