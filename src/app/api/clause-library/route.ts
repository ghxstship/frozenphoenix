import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("clause_library_entry");

export const { GET, POST } = createCollectionRoute(config);
