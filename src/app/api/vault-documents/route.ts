import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("vault_document");

export const { GET, POST } = createCollectionRoute({
    ...config,
    defaultSort: { column: "created_at", ascending: false },
});
