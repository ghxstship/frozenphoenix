import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";

const config = getEntityCrudConfig("rate_card_item");

export const { GET, PATCH, DELETE } = createItemRoute(config);
