"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { TruncatedText } from "@/components/ui/truncated-text";
import { useAdvanceCart } from "@/hooks/use-advance-cart";
import { formatAdvanceCost } from "@/config/advancing-config";
import { Badge } from "@/components/ui/badge";

interface AdvanceCartProps {
    isOpen: boolean;
    onClose: () => void;
    onCheckout: () => void;
    className?: string | undefined;
}

export function AdvanceCart({ isOpen, onClose, onCheckout, className }: AdvanceCartProps) {
    const items = useAdvanceCart((s) => s.items);
    const totalItems = useAdvanceCart((s) => s.total_items);
    const totalCost = useAdvanceCart((s) => s.total_estimated_cost);
    const removeItem = useAdvanceCart((s) => s.removeItem);
    const updateQuantity = useAdvanceCart((s) => s.updateItemQuantity);
    const clearCart = useAdvanceCart((s) => s.clearCart);

    if (!isOpen) return null;

    return (
        <div
            className={cn(
                "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l bg-background shadow-xl",
                className
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Advance cart"
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    <h2 className="text-lg font-semibold">Cart</h2>
                    {totalItems > 0 && <Badge variant="secondary">{totalItems}</Badge>}
                </div>
                <div className="flex items-center gap-2">
                    {items.length > 0 && (
                        <Button
                            variant="link"
                            size="sm"
                            onClick={clearCart}
                            className="text-xs text-destructive h-auto p-0"
                            aria-label="Clear cart"
                        >
                            Clear all
                        </Button>
                    )}
                    <Tooltip content="Close cart" side="bottom">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-8 w-8"
                            aria-label="Close cart"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </Tooltip>
                </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-muted-foreground">
                        <ShoppingCart className="h-10 w-10" />
                        <p className="text-sm">Your cart is empty</p>
                        <p className="text-xs">Browse the catalog to add items</p>
                    </div>
                ) : (
                    <ul className="divide-y" aria-label="Cart items">
                        {items.map((item) => (
                            <li key={item.catalog_item_id} className="flex gap-3 px-4 py-3">
                                {/* Thumbnail */}
                                {item.thumbnail_url ? (
                                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                                        <Image
                                            src={item.thumbnail_url}
                                            alt={item.name}
                                            fill
                                            sizes="56px"
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-muted text-lg text-muted-foreground/40">
                                        {item.name.charAt(0).toUpperCase()}
                                    </div>
                                )}

                                {/* Details */}
                                <div className="flex min-w-0 flex-1 flex-col gap-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <TruncatedText className="text-sm font-medium">
                                            {item.name}
                                        </TruncatedText>
                                        <Tooltip content={`Remove ${item.name}`} side="left">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeItem(item.catalog_item_id)}
                                                className="shrink-0 h-6 w-6 text-muted-foreground hover:text-destructive"
                                                aria-label={`Remove ${item.name}`}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </Tooltip>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {formatAdvanceCost(item.unit_cost)} each
                                    </span>

                                    {/* Quantity controls */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <Tooltip content="Decrease quantity" side="bottom">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.catalog_item_id,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    disabled={item.quantity <= 1}
                                                    className="h-6 w-6"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                            </Tooltip>
                                            <span className="w-8 text-center text-sm font-medium">
                                                {item.quantity}
                                            </span>
                                            <Tooltip content="Increase quantity" side="bottom">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.catalog_item_id,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    className="h-6 w-6"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </Tooltip>
                                        </div>
                                        <span className="text-sm font-semibold">
                                            {formatAdvanceCost(item.unit_cost * item.quantity)}
                                        </span>
                                    </div>

                                    {/* Modifiers summary */}
                                    {item.selected_modifiers &&
                                        item.selected_modifiers.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {item.selected_modifiers.map((mod) => (
                                                    <Badge
                                                        key={mod.modifier_id}
                                                        variant="outline"
                                                        className="density-caption"
                                                    >
                                                        {mod.option_label}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    {(item.start_date || item.end_date) && (
                                        <span className="density-caption text-muted-foreground">
                                            {item.start_date}
                                            {item.start_date && item.end_date && " \u2192 "}
                                            {item.end_date}
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
                <div className="border-t px-4 py-4">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Estimated Total ({totalItems} items)
                        </span>
                        <span className="text-lg font-bold">{formatAdvanceCost(totalCost)}</span>
                    </div>
                    <Button onClick={onCheckout} className="w-full">
                        Review & Submit
                    </Button>
                </div>
            )}
        </div>
    );
}

export function CartToggle({ onClick, className }: { onClick: () => void; className?: string }) {
    const totalItems = useAdvanceCart((s) => s.total_items);

    return (
        <Button
            variant="outline"
            onClick={onClick}
            className={cn("relative gap-1.5", className)}
            aria-label={`Open cart (${totalItems} items)`}
        >
            <ShoppingCart className="h-4 w-4" />
            Cart
            {totalItems > 0 && (
                <Badge
                    variant="destructive"
                    className="absolute -right-2 -top-2 h-5 min-w-5 justify-center p-0 density-caption"
                >
                    {totalItems}
                </Badge>
            )}
        </Button>
    );
}
