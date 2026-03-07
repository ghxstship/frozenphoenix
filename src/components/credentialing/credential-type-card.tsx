"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Ticket } from "lucide-react";

interface CredentialTypeCardProps {
    name: string;
    category: string;
    format: string;
    colorHex: string | null;
    tierLevel: number;
    isActive: boolean;
    defaultZoneAccess: string[];
    onClick?: () => void;
}

export function CredentialTypeCard({
    name,
    category,
    format,
    colorHex,
    tierLevel,
    isActive,
    defaultZoneAccess,
    onClick,
}: CredentialTypeCardProps) {
    return (
        <Card
            className={`cursor-pointer hover:shadow-sm transition-all ${!isActive ? "opacity-60" : ""}`}
            onClick={onClick}
        >
            <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {colorHex ? (
                            <span
                                className="inline-block h-4 w-4 rounded-full shrink-0"
                                style={{ backgroundColor: colorHex }}
                            />
                        ) : (
                            <Ticket className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <div>
                            <p className="text-sm font-semibold leading-tight">{name}</p>
                            <p className="text-[10px] text-muted-foreground capitalize">
                                {category.replace("_", " ")} · {format}
                            </p>
                        </div>
                    </div>
                    <Badge variant={isActive ? "success" : "ghost"} className="text-[9px]">
                        {isActive ? "Active" : "Inactive"}
                    </Badge>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Tier {tierLevel}</span>
                    <div className="flex flex-wrap gap-1">
                        {defaultZoneAccess.length === 0 ? (
                            <span className="text-muted-foreground">All zones</span>
                        ) : (
                            defaultZoneAccess.slice(0, 3).map((z) => (
                                <Badge key={z} variant="ghost" className="text-[9px]">
                                    {z}
                                </Badge>
                            ))
                        )}
                        {defaultZoneAccess.length > 3 && (
                            <Badge variant="ghost" className="text-[9px]">
                                +{defaultZoneAccess.length - 3}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
