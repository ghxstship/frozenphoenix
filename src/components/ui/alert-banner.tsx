import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SEVERITY_STYLES } from "@/config/ui-variants";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Severity = "warning" | "info" | "destructive";

interface AlertBannerProps {
    message: React.ReactNode;
    severity?: Severity;
    icon?: React.ComponentType<{ className?: string }>;
    className?: string;
}

export function AlertBanner({
    message,
    severity = "warning",
    icon: Icon = AlertCircle,
    className,
}: AlertBannerProps) {
    return (
        <Card className={cn(SEVERITY_STYLES[severity], className)}>
            <CardContent className="py-3 flex items-center gap-3">
                <Icon className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">{message}</p>
            </CardContent>
        </Card>
    );
}
