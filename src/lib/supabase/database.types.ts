/**
 * Re-export barrel — canonical types live at @/types/generated/database.types
 * This file exists only to avoid breaking imports that reference this path.
 * All new code should import from "@/types/generated/database.types" directly.
 */
export type {
    Database,
    Json,
    Tables,
    TablesInsert,
    TablesUpdate,
    Enums,
    CompositeTypes,
} from "@/types/generated/database.types";
