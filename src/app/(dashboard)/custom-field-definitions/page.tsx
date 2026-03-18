"use client";

import { ListPageShell } from "@/components/shells";
import { CUSTOM_FIELD_DEFINITIONS_PAGE } from "@/config/list-page-configs";
import {
    useCreateCustomField,
    useCreateCustomFieldDefinition,
    useCustomFields,
} from "@/lib/supabase/hooks-automation";

export default function CustomFieldDefinitionsPage() {
    const { data: _fields } = useCustomFields();
    const _createDef = useCreateCustomFieldDefinition();
    const _createField = useCreateCustomField();
    return <ListPageShell config={CUSTOM_FIELD_DEFINITIONS_PAGE} />;
}
