"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CatalogBrowser } from "@/components/advancing/catalog-browser";
import { AdvanceCart, CartToggle } from "@/components/advancing/advance-cart";
import { AdvanceCheckout } from "@/components/advancing/advance-checkout";
import { useAdvanceCart } from "@/hooks/use-advance-cart";
import { ListPageShell } from "@/components/shells";
import type { ListPageConfig } from "@/types/list-page-config";

type ViewState = "browse" | "checkout";

export function NewAdvancingOrderPageClient() {
    const router = useRouter();
    const [view, setView] = React.useState<ViewState>("browse");
    const [cartOpen, setCartOpen] = React.useState(false);
    const addItem = useAdvanceCart((s) => s.addItem);

    const handleAddItem = React.useCallback(
        (item: {
            catalog_item_id: string;
            name: string;
            sku: string;
            unit_cost: number;
            thumbnail_url?: string | undefined;
            is_critical_path: boolean;
        }) => {
            addItem({
                catalog_item_id: item.catalog_item_id,
                name: item.name,
                sku: item.sku,
                unit_cost: item.unit_cost,
                quantity: 1,
                thumbnail_url: item.thumbnail_url,
                is_critical_path: item.is_critical_path,
            });
        },
        [addItem]
    );

    const handleSuccess = React.useCallback(
        (advanceId: string) => {
            router.push(`/advancing/${advanceId}`);
        },
        [router]
    );

    const config: ListPageConfig = React.useMemo(
        () => ({
            entityKey: "advancing",
            resource: "advancing",
            action: "write",
            title: view === "browse" ? "New Advance" : "Review Advance",
            description:
                view === "browse"
                    ? "Browse the catalog and add items to your advance"
                    : "Review and submit your advance for approval",
            headerActions:
                view === "browse" ? (
                    <CartToggle onClick={() => setCartOpen(!cartOpen)} />
                ) : undefined,
            contentSlot: (
                <>
                    {view === "browse" && <CatalogBrowser onAddItem={handleAddItem} />}

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
                </>
            ),
        }),
        [view, cartOpen, handleAddItem, handleSuccess]
    );

    return <ListPageShell config={config} data={[]} isLoading={false} />;
}
