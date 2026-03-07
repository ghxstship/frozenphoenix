"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layouts/page-shell";
import { PermissionGate } from "@/components/permission-guard";
import { CatalogBrowser } from "@/components/advancing/catalog-browser";
import { AdvanceCart, CartToggle } from "@/components/advancing/advance-cart";
import { AdvanceCheckout } from "@/components/advancing/advance-checkout";
import { useAdvanceCart } from "@/hooks/use-advance-cart";

type ViewState = "browse" | "checkout";

export default function NewAdvancePage() {
    const router = useRouter();
    const [view, setView] = React.useState<ViewState>("browse");
    const [cartOpen, setCartOpen] = React.useState(false);
    const addItem = useAdvanceCart((s) => s.addItem);

    function handleAddItem(item: {
        catalog_item_id: string;
        name: string;
        sku: string;
        unit_cost: number;
        thumbnail_url?: string;
        is_critical_path: boolean;
    }) {
        addItem({
            catalog_item_id: item.catalog_item_id,
            name: item.name,
            sku: item.sku,
            unit_cost: item.unit_cost,
            quantity: 1,
            thumbnail_url: item.thumbnail_url,
            is_critical_path: item.is_critical_path,
        });
    }

    function handleSuccess(advanceId: string) {
        router.push(`/advancing/${advanceId}`);
    }

    return (
        <PermissionGate resource="advancing" action="write">
            <PageShell
                title={view === "browse" ? "New Advance" : "Review Advance"}
                description={
                    view === "browse"
                        ? "Browse the catalog and add items to your advance"
                        : "Review and submit your advance for approval"
                }
                actions={
                    view === "browse" ? (
                        <CartToggle onClick={() => setCartOpen(!cartOpen)} />
                    ) : undefined
                }
            >
                {view === "browse" && (
                    <CatalogBrowser onAddItem={handleAddItem} />
                )}

                {view === "checkout" && (
                    <AdvanceCheckout
                        onBack={() => setView("browse")}
                        onSuccess={handleSuccess}
                    />
                )}

                {/* Cart drawer */}
                <AdvanceCart
                    isOpen={cartOpen}
                    onClose={() => setCartOpen(false)}
                    onCheckout={() => {
                        setCartOpen(false);
                        setView("checkout");
                    }}
                />
            </PageShell>
        </PermissionGate>
    );
}
