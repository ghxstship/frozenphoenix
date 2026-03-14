import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("stakeholder");

export const { GET, POST } = createCollectionRoute({
    ...config,
    defaultSort: { column: "name", ascending: true },
});
