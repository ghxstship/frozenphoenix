"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { Area, Point } from "react-easy-crop";

// Define the exact subset of CropperProps we use — fully typed, no `any`.
interface AvatarCropperProps {
    image: string;
    crop: Point;
    zoom: number;
    rotation: number;
    aspect: number;
    cropShape: "rect" | "round";
    showGrid: boolean;
    onCropChange: (location: Point) => void;
    onZoomChange: (zoom: number) => void;
    onRotationChange: (rotation: number) => void;
    onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
}

const Cropper = dynamic(() => import("react-easy-crop").then((m) => m.default), {
    ssr: false,
    loading: () => <div className="w-full aspect-square rounded-lg bg-muted animate-shimmer" />,
}) as unknown as React.ComponentType<AvatarCropperProps>;
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCw, ZoomIn, ZoomOut } from "lucide-react";

// ─── Types ───

interface AvatarCropDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    imageSrc: string;
    onCropComplete: (croppedBlob: Blob) => void;
    loading?: boolean;
}

// ─── Canvas crop helper ───

async function getCroppedBlob(imageSrc: string, pixelCrop: Area, rotation: number): Promise<Blob> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");

    const radians = (rotation * Math.PI) / 180;

    // Bounding box of rotated image
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));
    const bBoxWidth = image.width * cos + image.height * sin;
    const bBoxHeight = image.width * sin + image.height * cos;

    // Set canvas to bounding box, draw rotated image centered
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(radians);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);

    // Extract the cropped area
    const cropData = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);

    // Output canvas at crop size
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.putImageData(cropData, 0, 0);

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Canvas toBlob failed"));
            },
            "image/jpeg",
            0.92
        );
    });
}

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.addEventListener("load", () => resolve(img));
        img.addEventListener("error", (e) => reject(e));
        img.setAttribute("crossOrigin", "anonymous");
        img.src = url;
    });
}

// ─── Component ───

export function AvatarCropDialog({
    open,
    onOpenChange,
    imageSrc,
    onCropComplete,
    loading = false,
}: AvatarCropDialogProps) {
    const [crop, setCrop] = React.useState({ x: 0, y: 0 });
    const [zoom, setZoom] = React.useState(1);
    const [rotation, setRotation] = React.useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(null);

    const handleCropComplete = React.useCallback((_: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleConfirm = React.useCallback(async () => {
        if (!croppedAreaPixels) return;
        const blob = await getCroppedBlob(imageSrc, croppedAreaPixels, rotation);
        onCropComplete(blob);
    }, [croppedAreaPixels, imageSrc, rotation, onCropComplete]);

    // Reset state when dialog opens with new image
    React.useEffect(() => {
        if (open) {
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setRotation(0);
            setCroppedAreaPixels(null);
        }
    }, [open, imageSrc]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="md" showClose={!loading}>
                <DialogHeader>
                    <DialogTitle>Crop Photo</DialogTitle>
                    <DialogDescription>
                        Drag to reposition. Use zoom and rotate to adjust.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted my-4">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        onCropComplete={handleCropComplete}
                    />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                        <ZoomOut className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.05}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-28 accent-primary"
                            aria-label="Zoom"
                        />
                        <ZoomIn className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRotation((r) => (r + 90) % 360)}
                        aria-label="Rotate 90 degrees"
                    >
                        <RotateCw className="h-4 w-4" />
                    </Button>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={loading || !croppedAreaPixels}>
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 motion-safe:animate-spin mr-2" />
                                Uploading…
                            </>
                        ) : (
                            "Save Photo"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
