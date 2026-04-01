"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { useMessagingStrings } from "@/hooks/use-messaging-strings";

interface VoiceMessagePlayerProps {
    src?: string | undefined;
    durationSeconds: number;
    className?: string | undefined;
}

export function VoiceMessagePlayer({ src, durationSeconds, className }: VoiceMessagePlayerProps) {
    const ms = useMessagingStrings();
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const animRef = React.useRef<number | null>(null);

    const tickRef = React.useRef<() => void>(() => {});

    React.useEffect(() => {
        tickRef.current = () => {
            const audio = audioRef.current;
            if (!audio) return;
            if (audio.duration && Number.isFinite(audio.duration)) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
            if (!audio.paused) {
                animRef.current = requestAnimationFrame(tickRef.current);
            }
        };
    });

    React.useEffect(() => {
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const toggle = React.useCallback(() => {
        if (!src) return;

        if (!audioRef.current) {
            const audio = new Audio(src);
            audio.onended = () => {
                setIsPlaying(false);
                setProgress(0);
            };
            audioRef.current = audio;
        }

        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play().catch(() => {
                setIsPlaying(false);
            });
            setIsPlaying(true);
            animRef.current = requestAnimationFrame(tickRef.current);
        }
    }, [src, isPlaying]);

    const formatDuration = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = Math.floor(s % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div
            className={cn(
                "flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 min-w-[160px]",
                className
            )}
            role="group"
            aria-label={ms("a11y_voice_player")}
        >
            <Tooltip content={isPlaying ? ms("voice_pause") : ms("voice_play")} side="top">
                <Button
                    size="icon"
                    onClick={toggle}
                    disabled={!src}
                    className="h-7 w-7 shrink-0 rounded-full"
                    aria-label={isPlaying ? ms("voice_pause") : ms("voice_play")}
                >
                    {isPlaying ? (
                        <Pause className="h-3 w-3 fill-current" />
                    ) : (
                        <Play className="h-3 w-3 fill-current ml-0.5" />
                    )}
                </Button>
            </Tooltip>

            <div className="flex-1 min-w-0">
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                        className="h-full rounded-full bg-primary transition-all duration-100"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <span className="density-caption font-mono tabular-nums text-muted-foreground shrink-0">
                {formatDuration(durationSeconds)}
            </span>
        </div>
    );
}
