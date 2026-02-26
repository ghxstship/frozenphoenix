// ═══════════════════════════════════════════════════════════════
// Supabase Integration — Barrel Export
// ═══════════════════════════════════════════════════════════════
// Single import point for all Supabase functionality.
// Usage: import { useDeals, uploadFile, useSignOut } from "@/lib/supabase";

// ─── Configuration ───
export { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from "./config";

// ─── Clients ───
export { createClient } from "./client";
export { createClient as createServerClient } from "./server";

// ─── Auth Actions ───
export {
    signInWithPassword,
    signUp,
    signInWithOAuth,
    signInWithMagicLink,
    signOut,
    resetPassword,
    updatePassword,
    updateEmail,
    updateUserMetadata,
    updateProfile,
    getCurrentUser,
    getCurrentSession,
    refreshSession,
    enrollMFA,
    challengeMFA,
    verifyMFA,
    unenrollMFA,
    listMFAFactors,
    getMFAAssuranceLevel,
    useSignInWithPassword,
    useSignUp,
    useSignInWithOAuth,
    useSignInWithMagicLink,
    useSignOut,
    useResetPassword,
    useUpdatePassword,
    useUpdateEmail,
    useUpdateUserMetadata,
    useUpdateProfile,
    useEnrollMFA,
    useVerifyMFA,
    useUnenrollMFA,
} from "./auth-actions";

// ─── Auth Context ───
export { AuthProvider, useAuth } from "./auth-context";

// ─── Storage ───
export {
    STORAGE_BUCKETS,
    uploadFile,
    downloadFile,
    getSignedUrl,
    getSignedUrls,
    getPublicUrl,
    deleteFiles,
    moveFile,
    copyFile,
    listFiles,
    useUploadFile,
    useDeleteFiles,
    useMoveFile,
    useListFiles,
    useSignedUrl,
    buildStoragePath,
    buildAvatarPath,
    buildExpenseReceiptPath,
    buildDeliverablePath,
    getFileSizeDisplay,
    isImageFile,
    isDocumentFile,
} from "./storage";

// ─── Realtime ───
export {
    useRealtimeSubscription,
    useNotificationsRealtime,
    useActivityRealtime,
    useCommentsRealtime,
    useDomainEventSubscription,
    useProjectRealtime,
    useDealsRealtime,
    useApprovalsRealtime,
    useBudgetsRealtime,
    useContractsRealtime,
    useInvoicesRealtime,
    useWorkflowRealtime,
    useESignaturesRealtime,
    useCrewShiftsRealtime,
    useIncidentsRealtime,
    useFullProjectRealtime,
} from "./realtime";

// ─── Mutation Utilities ───
export {
    useOptimisticMutation,
    getOrCreateIdempotencyKey,
    clearIdempotencyKey,
    getPaginationRange,
} from "./mutation-utils";

// ─── Database Types ───
export type { Database, Tables, TablesInsert, TablesUpdate, Enums } from "./database.types";
