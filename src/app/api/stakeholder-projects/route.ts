import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("stakeholder_project");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "stakeholder_id", operator: "eq" },
        { column: "project_id", operator: "eq" },
        { column: "organization_id", operator: "eq" },
    ],
});
