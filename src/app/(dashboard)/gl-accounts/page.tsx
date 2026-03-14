"use client";

import { ListPageShell } from "@/components/shells";
import { useGlAccounts } from "@/lib/supabase/hooks-pages";
import { CREATE_GL_ACCOUNT_CONFIG } from "@/config/create-entity-configs";
import { CircleDollarSign } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "gl_accounts",
    title: "GL Accounts",
    description:
        "Chart of accounts for financial reporting — maps budgets, expenses, invoices, and payments to GL codes",
    icon: CircleDollarSign,
    createConfig: CREATE_GL_ACCOUNT_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "code", header: "Code", accessorKey: "code" },
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "type", header: "Type", accessorKey: "type" },
        { id: "capex_opex", header: "CapEx / OpEx", accessorKey: "capex_opex" },
        { id: "department", header: "Department", accessorKey: "department" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
    ],
};

export default function GLAccountsPage() {
    const { data: rawData, isLoading } = useGlAccounts();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
