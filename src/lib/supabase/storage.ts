"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase, isSupabaseConfigured } from "./client";

// ─── Bucket Constants ───
// Canonical bucket names used across the platform.
// Buckets must be pre-created in Supabase Dashboard or via migrations.
export const STORAGE_BUCKETS = {
    AVATARS: "avatars",
    ASSETS: "assets",
    DOCUMENTS: "documents",
    CONTRACTS: "contracts",
    BRAND_KITS: "brand-kits",
    DELIVERABLES: "deliverables",
    EXPENSES: "expenses",
    TEMP: "temp",
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

// ─── Types ───

export interface StorageFile {
    name: string;
    id: string | null;
    updated_at: string | null;
    created_at: string | null;
    last_accessed_at: string | null;
    metadata: Record<string, unknown> | null;
}

export interface UploadOptions {
    bucket: StorageBucket;
    path: string;
    file: File | Blob;
    contentType?: string;
    upsert?: boolean;
    cacheControl?: string;
}

export interface UploadResult {
    path: string;
    fullPath: string;
    publicUrl: string | null;
}

export interface SignedUrlOptions {
    bucket: StorageBucket;
    path: string;
    expiresIn?: number; // seconds, default 3600
    download?: boolean | string;
    transform?: {
        width?: number;
        height?: number;
        quality?: number;
        format?: "origin";
        resize?: "cover" | "contain" | "fill";
    };
}

export interface MoveOptions {
    bucket: StorageBucket;
    fromPath: string;
    toPath: string;
}

export interface CopyOptions {
    fromBucket: StorageBucket;
    fromPath: string;
    toBucket: StorageBucket;
    toPath: string;
}

// ─── Core Storage Functions ───

export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
    const supabase = getSupabase();
    const { bucket, path, file, contentType, upsert = false, cacheControl = "3600" } = options;

    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        contentType: contentType ?? file.type,
        upsert,
        cacheControl,
    });

    if (error) throw error;

    const {
        data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return {
        path: data.path,
        fullPath: `${bucket}/${data.path}`,
        publicUrl,
    };
}

export async function downloadFile(bucket: StorageBucket, path: string): Promise<Blob> {
    const supabase = getSupabase();

    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error) throw error;

    return data;
}

export async function getSignedUrl(options: SignedUrlOptions): Promise<string> {
    const supabase = getSupabase();
    const { bucket, path, expiresIn = 3600, download, transform } = options;

    const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn, { download, transform });

    if (error) throw error;

    return data.signedUrl;
}

export async function getSignedUrls(
    bucket: StorageBucket,
    paths: string[],
    expiresIn = 3600
): Promise<{ path: string | null; signedUrl: string; error: string | null }[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase.storage.from(bucket).createSignedUrls(paths, expiresIn);

    if (error) throw error;

    return data;
}

export async function getPublicUrl(
    bucket: StorageBucket,
    path: string,
    transform?: SignedUrlOptions["transform"]
): Promise<string> {
    const supabase = getSupabase();

    const {
        data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path, { transform });

    return publicUrl;
}

export async function deleteFiles(bucket: StorageBucket, paths: string[]): Promise<void> {
    const supabase = getSupabase();

    const { error } = await supabase.storage.from(bucket).remove(paths);
    if (error) throw error;
}

export async function moveFile(options: MoveOptions): Promise<void> {
    const supabase = getSupabase();
    const { bucket, fromPath, toPath } = options;

    const { error } = await supabase.storage.from(bucket).move(fromPath, toPath);
    if (error) throw error;
}

export async function copyFile(options: CopyOptions): Promise<void> {
    const supabase = getSupabase();
    const { fromBucket, fromPath, toBucket, toPath } = options;

    const { error } = await supabase.storage
        .from(fromBucket)
        .copy(fromPath, `${toBucket}/${toPath}`);
    if (error) throw error;
}

export async function listFiles(
    bucket: StorageBucket,
    folderPath?: string,
    options?: {
        limit?: number;
        offset?: number;
        sortBy?: { column: string; order: "asc" | "desc" };
        search?: string;
    }
): Promise<StorageFile[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase.storage.from(bucket).list(folderPath ?? "", {
        limit: options?.limit ?? 100,
        offset: options?.offset ?? 0,
        sortBy: options?.sortBy ?? { column: "name", order: "asc" },
        search: options?.search,
    });

    if (error) throw error;

    return data as StorageFile[];
}

// ─── React Query Hooks ───

export function useUploadFile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (options: UploadOptions) => uploadFile(options),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["storage", variables.bucket],
            });
        },
    });
}

export function useDeleteFiles() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ bucket, paths }: { bucket: StorageBucket; paths: string[] }) =>
            deleteFiles(bucket, paths),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["storage", variables.bucket],
            });
        },
    });
}

export function useMoveFile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (options: MoveOptions) => moveFile(options),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["storage", variables.bucket],
            });
        },
    });
}

export function useListFiles(
    bucket: StorageBucket,
    folderPath?: string,
    options?: {
        limit?: number;
        offset?: number;
        sortBy?: { column: string; order: "asc" | "desc" };
        search?: string;
    }
) {
    return useQuery({
        queryKey: ["storage", bucket, folderPath, options],
        queryFn: () => listFiles(bucket, folderPath, options),
        enabled: isSupabaseConfigured,
    });
}

export function useSignedUrl(
    bucket: StorageBucket,
    path: string,
    options?: { expiresIn?: number; transform?: SignedUrlOptions["transform"] }
) {
    return useQuery({
        queryKey: ["storage", "signed", bucket, path, options],
        queryFn: () =>
            getSignedUrl({
                bucket,
                path,
                expiresIn: options?.expiresIn,
                transform: options?.transform,
            }),
        enabled: isSupabaseConfigured && !!path,
        staleTime: ((options?.expiresIn ?? 3600) - 60) * 1000, // Refetch 60s before expiry
    });
}

// ─── Helpers ───

export function buildStoragePath(entityType: string, entityId: string, filename: string): string {
    return `${entityType}/${entityId}/${filename}`;
}

export function buildAvatarPath(userId: string, filename: string): string {
    const ext = filename.split(".").pop() ?? "jpg";
    return `${userId}/avatar.${ext}`;
}

export function buildExpenseReceiptPath(expenseId: string, filename: string): string {
    return `receipts/${expenseId}/${filename}`;
}

export function buildDeliverablePath(
    projectId: string,
    deliverableId: string,
    filename: string
): string {
    return `${projectId}/${deliverableId}/${filename}`;
}

export function getFileSizeDisplay(bytes: number): string {
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function isImageFile(filename: string): boolean {
    const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico", "avif", "heic"];
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    return imageExts.includes(ext);
}

export function isDocumentFile(filename: string): boolean {
    const docExts = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv", "rtf"];
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    return docExts.includes(ext);
}
