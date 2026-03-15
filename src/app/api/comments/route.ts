/**
 * @deprecated Legacy comments table route. The unified messaging system
 * uses /api/messages/entity for entity-scoped comments via the messages table.
 * This route remains for backward compatibility when messaging_enabled feature flag is off.
 */
import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("comment");

export const { GET, POST } = createCollectionRoute({
    ...config,
    filters: [
        { column: "entity_type", operator: "eq" },
        { column: "entity_id", operator: "eq" },
    ],
    defaultSort: { column: "created_at", ascending: false },
});
