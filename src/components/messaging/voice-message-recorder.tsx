"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2, Mic, Send, Square, Trash2 } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { useMessagingStrings } from "@/hooks/use-messaging-strings";

interface VoiceMessageRecorderProps {
    onSend: (blob: Blob, durationSeconds: number) => void;
    disabled?: boolean;
    maxDurationSeconds?: number;
    className?: string;
}

type RecordingState = "idle" | "requesting" | "recording" | "stopped";

export function VoiceMessageRecorder({
    onSend,
    disabled = false,
    maxDurationSeconds = 120,
    className,
}: VoiceMessageRecorderProps) {
    const ms = useMessagingStrings();
    const [state, setState] = React.useState<RecordingState>("idle");
    const [duration, setDuration] = React.useState(0);
    const [error, setError] = React.useState<string | null>(null);
    const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);

    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const chunksRef = React.useRef<Blob[]>([]);
    const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = React.useRef<number>(0);

    const cleanup = React.useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
        mediaRecorderRef.current = null;
        chunksRef.current = [];
    }, []);

    React.useEffect(() => {
        return cleanup;
    }, [cleanup]);

    const startRecording = React.useCallback(async () => {
        setError(null);
        setAudioBlob(null);
        setState("requesting");

        if (!navigator.mediaDevices?.getUserMedia) {
            setError(ms("voice_unsupported"));
            setState("idle");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                    ? "audio/webm;codecs=opus"
                    : "audio/webm",
            });

            chunksRef.current = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                setAudioBlob(blob);
                stream.getTracks().forEach((t) => t.stop());
            };

            mediaRecorderRef.current = recorder;
            recorder.start(250);
            startTimeRef.current = Date.now();
            setState("recording");

            timerRef.current = setInterval(() => {
                const elapsed = (Date.now() - startTimeRef.current) / 1000;
                setDuration(elapsed);
                if (elapsed >= maxDurationSeconds) {
                    recorder.stop();
                    if (timerRef.current) clearInterval(timerRef.current);
                    setState("stopped");
                }
            }, 100);
        } catch {
            setError(ms("voice_permission_denied"));
            setState("idle");
        }
    }, [ms, maxDurationSeconds]);

    const stopRecording = React.useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setState("stopped");
    }, []);

    const cancelRecording = React.useCallback(() => {
        cleanup();
        setAudioBlob(null);
        setDuration(0);
        setState("idle");
    }, [cleanup]);

    const handleSend = React.useCallback(() => {
        if (!audioBlob || duration < 0.5) return;
        onSend(audioBlob, duration);
        setAudioBlob(null);
        setDuration(0);
        setState("idle");
    }, [audioBlob, duration, onSend]);

    const formatDuration = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = Math.floor(s % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (state === "idle") {
        return (
            <Tooltip content={ms("voice_record")} side="top">
                <button
                    onClick={startRecording}
                    disabled={disabled}
                    className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        className
                    )}
                    aria-label={ms("voice_record")}
                >
                    <Mic className="h-4 w-4" />
                </button>
            </Tooltip>
        );
    }

    if (state === "requesting") {
        return (
            <div className={cn("flex items-center gap-2 px-3 py-1.5", className)}>
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Requesting microphone...</span>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-1.5",
                state === "recording" ? "border-destructive/40 bg-destructive/5" : "border-border",
                className
            )}
            role="group"
            aria-label={ms("a11y_voice_recorder")}
        >
            {state === "recording" && (
                <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            )}

            <span className="text-xs font-mono tabular-nums min-w-[3ch]">
                {formatDuration(duration)}
            </span>

            {state === "recording" && (
                <Tooltip content={ms("voice_stop")} side="top">
                    <button
                        onClick={stopRecording}
                        className="h-7 w-7 rounded-md flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                        aria-label={ms("voice_stop")}
                    >
                        <Square className="h-3 w-3 fill-current" />
                    </button>
                </Tooltip>
            )}

            {state === "stopped" && (
                <>
                    <Tooltip content={ms("voice_cancel")} side="top">
                        <button
                            onClick={cancelRecording}
                            className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            aria-label={ms("voice_cancel")}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </Tooltip>
                    <Tooltip content={ms("voice_send")} side="top">
                        <button
                            onClick={handleSend}
                            className="h-7 w-7 rounded-md flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            aria-label={ms("voice_send")}
                        >
                            <Send className="h-3.5 w-3.5" />
                        </button>
                    </Tooltip>
                </>
            )}

            {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
    );
}
