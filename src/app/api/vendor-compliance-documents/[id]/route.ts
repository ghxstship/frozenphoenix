import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("vendor_compliance_document");

export const { GET, PATCH, DELETE } = createItemRoute(config);
