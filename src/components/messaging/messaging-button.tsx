"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useMessaging } from "@/hooks/use-messaging";

interface MessagingButtonProps {
    entityType: string;
    entityId: string;
    label?: string;
    className?: string;
}

export function MessagingButton({
    entityType,
    entityId,
    label = "Message",
    className,
}: MessagingButtonProps) {
    const { setPanelOpen, setEntityContext } = useMessaging();

    const handleClick = () => {
        setEntityContext({ type: entityType, id: entityId });
        setPanelOpen(true);
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleClick}
            className={className}
            aria-label={`Open messaging for this ${entityType}`}
        >
            <MessageSquare className="h-4 w-4 mr-1.5" />
            {label}
        </Button>
    );
}
