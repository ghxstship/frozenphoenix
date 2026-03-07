export { createCollectionRoute, createCrudHandlers, createItemRoute } from "./crud-factory";
export type {
    CollectionRouteHandlers,
    CrudConfig,
    CrudHandlers,
    FilterConfig,
    ItemRouteHandlers,
    SortConfig,
} from "./crud-factory";

export { createEntityMutations, createMutationHooks } from "./mutation-hook-factory";
export type {
    CreateOptions,
    DeleteOptions,
    EntityHookSet,
    MutationHookConfig,
    TransitionOptions,
    UpdateOptions,
} from "./mutation-hook-factory";

export {
    ENTITY_CONFIGS,
    getEntityConfig,
    getEntityConfigBySlug,
    getEntityCrudConfig,
    toCrudConfig,
} from "./entity-config";
export type { EntityConfig } from "./entity-config";
