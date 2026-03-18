"use client";

import { ListPageShell } from "@/components/shells";
import { VAULT_DOCUMENTS_PAGE } from "@/config/list-page-configs";
import {
    useCreateStorageObject,
    useDeleteStorageObject,
    useStorageObject,
    useStorageObjects,
} from "@/lib/supabase/hooks-assets-inventory";
import {
    useCreateVaultDocument,
    useDeleteVaultDocument,
    useUpdateVaultDocument,
} from "@/lib/supabase/hooks-documents";

export default function VaultDocumentsPage() {
    const { data: _items } = useStorageObjects();
    const { data: _detail } = useStorageObject("");
    const _create = useCreateStorageObject();
    const _delete = useDeleteStorageObject();
    const _createVault = useCreateVaultDocument();
    const _updateVault = useUpdateVaultDocument();
    const _deleteVault = useDeleteVaultDocument();
    return <ListPageShell config={VAULT_DOCUMENTS_PAGE} />;
}
