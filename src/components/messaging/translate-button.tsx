"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Globe, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip } from "@/components/ui/tooltip";
import { useMessagingStrings } from "@/hooks/use-messaging-strings";

const LANGUAGES = [
    { code: "es", label: "Spanish" },
    { code: "fr", label: "French" },
    { code: "de", label: "German" },
    { code: "pt", label: "Portuguese" },
    { code: "ja", label: "Japanese" },
    { code: "zh", label: "Chinese" },
    { code: "ko", label: "Korean" },
    { code: "ar", label: "Arabic" },
    { code: "hi", label: "Hindi" },
    { code: "it", label: "Italian" },
] as const;

interface TranslateButtonProps {
    messageId: string;
    body: string;
    onTranslate: (messageId: string, body: string, targetLanguage: string) => void;
    isTranslating?: boolean | undefined;
    translatedText?: string | null | undefined;
    onShowOriginal?: (() => void) | undefined;
    className?: string | undefined;
}

export function TranslateButton({
    messageId,
    body,
    onTranslate,
    isTranslating = false,
    translatedText,
    onShowOriginal,
    className,
}: TranslateButtonProps) {
    const ms = useMessagingStrings();

    if (translatedText) {
        return (
            <div className={cn("mt-1.5 space-y-1", className)}>
                <p className="text-xs text-foreground/80 italic bg-secondary/30 rounded px-2 py-1">
                    {translatedText}
                </p>
                <button
                    onClick={onShowOriginal}
                    className="density-caption text-primary hover:underline"
                >
                    {ms("translate_show_original")}
                </button>
            </div>
        );
    }

    if (isTranslating) {
        return (
            <div className={cn("flex items-center gap-1 mt-1", className)}>
                <Loader2 className="h-3 w-3 motion-safe:animate-spin text-muted-foreground" />
                <span className="density-caption text-muted-foreground">
                    {ms("translate_translating")}
                </span>
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Tooltip content={ms("translate_button")} side="top">
                    <button
                        className={cn(
                            "inline-flex items-center gap-1 mt-1 density-caption text-muted-foreground hover:text-foreground transition-colors",
                            className
                        )}
                        aria-label={ms("translate_button")}
                    >
                        <Globe className="h-3 w-3" />
                        {ms("translate_button")}
                    </button>
                </Tooltip>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-36">
                {LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => onTranslate(messageId, body, lang.code)}
                        className="text-xs"
                    >
                        {lang.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
