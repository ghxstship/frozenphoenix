// ═══════════════════════════════════════════════════════════════
// Supabase Integration — Barrel Export
// ═══════════════════════════════════════════════════════════════
// Single import point for all Supabase functionality.
// Usage: import { useDeals, uploadFile, useSignOut } from "@/lib/supabase";
//
// POLICY: This is the ONLY valid import path for hooks in consumer files.
// No consumer may import from domain hook files directly.

// ─── Hook Factories ───
export {
    makeCreateHook,
    makeDeleteHook,
    makeDetailHook,
    makeListHook,
    makeUpdateHook,
} from "./hook-factories";
export type { FilterParams } from "./hook-factories";

// ─── Hook Types (SSOT for all join-aware types) ───
export type * from "./hook-types";

// ─── Configuration ───
export { supabaseUrl, supabaseAnonKey } from "./config";

// ─── Clients ───
export { createClient } from "./client";
// NOTE: createServerClient is NOT re-exported here because server.ts imports
// next/headers which is server-only. Import directly from "@/lib/supabase/server".

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

// ═══════════════════════════════════════════════════════════════
// DOMAIN HOOK FILES — Normalized architecture
// Using export * for all new domain files.
// ═══════════════════════════════════════════════════════════════

export * from "./hooks-core";
export * from "./hooks-crm";
export * from "./hooks-finance";
export * from "./hooks-workforce";
export * from "./hooks-production";
export * from "./hooks-assets-inventory";
export * from "./hooks-documents";
export * from "./hooks-legal";
export * from "./hooks-automation";
export * from "./hooks-admin";
export * from "./hooks-live-ops";
export * from "./hooks-feature-gaps";

// ═══════════════════════════════════════════════════════════════
// UNCHANGED DOMAIN FILES
// Named exports to avoid conflicts with domain files above.
// ═══════════════════════════════════════════════════════════════

// ─── Advancing ───
export {
    useCatalogCategories,
    useCatalogCategory,
    useCatalogItems,
    useCatalogItemSearch,
    useCatalogItem,
    useCatalogItemModifiers,
    useCatalogOrgOverrides,
    useCatalogOrgOverride,
    useCatalogPricingTiers,
    useCatalogPricingTiersBatch,
    useAdvances,
    useAdvance,
    useCreateAdvance,
    useUpdateAdvance,
    useDeleteAdvance,
    useAdvanceStatusTransition,
    useAdvanceItems,
    useCreateAdvanceItem,
    useUpdateAdvanceItem,
    useDeleteAdvanceItem,
    useAdvanceItemStatusTransition,
    useAdvanceStatusHistory,
    useAdvanceTemplates,
    useAdvanceTemplate,
    useCreateAdvanceTemplate,
    useUpdateAdvanceTemplate,
    useDeleteAdvanceTemplate,
} from "./hooks-advancing";

// ─── Advancing Realtime ───
export {
    useAdvancesRealtime,
    useAdvanceStatusHistoryRealtime,
    useCatalogRealtime,
} from "./realtime-advancing";

// ─── Credentialing ───
export {
    useBulkImportJob,
    useBulkImportJobs,
    useCreateBulkImportJob,
    useCreateCredentialAssignment,
    useCreateCredentialPool,
    useCreateCredentialType,
    useCreateExportTemplate,
    useCreateScanEntry,
    useCredentialAssignment,
    useCredentialAssignments,
    useCredentialPool,
    useCredentialPools,
    useCredentialScanLogs,
    useCredentialType,
    useCredentialTypes,
    useExportTemplates,
    useUpdateCredentialAssignment,
    useUpdateCredentialPool,
    useUpdateCredentialType,
    useUpdateExportTemplate,
} from "./hooks-credentialing";

// ─── External Sync & POS ───
export {
    useCreateProviderConnection,
    useCreateSyncConflictPolicy,
    useDeleteProviderConnection,
    usePosTransaction,
    usePosTransactions,
    useProviderConnection,
    useProviderConnections,
    useProviderTicketMap,
    useSyncConflictPolicies,
    useSyncEvents as useSyncEventsExternal,
    useUpdateProviderConnection,
    useUpdateSyncConflictPolicy,
    useWebhookEvents,
} from "./hooks-external-sync";

// ─── Messaging ───
export {
    messagingKeys,
    useConversations,
    useConversation,
    useConversationMembers,
    useMessages,
    useEntityMessages,
    useThreadMessages,
    useUnreadCounts,
    usePinnedMessages,
    useCreateConversation,
    useUpdateConversation,
    useSendMessage,
    useEditMessage,
    useDeleteMessage as useDeleteMessageHook,
    useToggleReaction,
    usePinMessage,
    useMarkRead,
    useAcknowledgeMandatoryRead,
    useAddConversationMembers,
    useRemoveConversationMember,
    useOrgMembers,
    useSendVoiceMessage,
    useAISummary,
    useTranslateMessage,
    useUpdateSMSFallback,
} from "./hooks-messaging";
export type { VoiceMessagePayload, AISummaryResult, TranslationResult } from "./hooks-messaging";

// ─── Messaging Realtime ───
export {
    useTypingIndicator,
    usePresence,
    useMessagesRealtime,
    useConversationsRealtime,
} from "./hooks-messaging-realtime";

// ─── Approval Engine ───
export {
    useApprovalInstanceStatus,
    useInitiateApproval,
    useApprovalDecision,
    useEscalateApproval,
    useCancelApproval,
} from "./hooks-approval-engine";

// ─── Context Switcher ───
export {
    useTeamsForSwitcher,
    useTeamMembers,
    useClientsForSwitcher,
    useProjectsForSwitcher,
    useActivationsForSwitcher,
} from "./hooks-switcher";

// ─── SOW & Invoicing ───
export * from "./hooks-sow";

// ─── Workflows & Approval (join-aware) ───
export * from "./hooks-workflows";

// ─── Collaborator Lifecycle ───
export {
    useProjectCommTemplates,
    useGenerateCommTemplates,
    useUpdateCommTemplate,
    useProjectCollaborators,
    useProjectCollaborator,
    useInviteCollaborator,
    useUpdateCollaborator,
    useCollaboratorRequirements,
    useIssueContract,
    useRequestCoi,
    useCrewSubmissions,
} from "./hooks-collaborators";
export type { InviteCollaboratorPayload } from "./hooks-collaborators";

// ─── Scanning ───
export { useAssetLookup, useAssetScan, useAssetScanHistory } from "./hooks-scanning";
export type {
    AssetScanAction,
    AssetScanPayload,
    AssetScanResult,
    AssetLookupResult,
    ScanIdentifierType,
    ApiScanMethod,
} from "./hooks-scanning";

// ─── Database Types ───
export type { Database, Tables, TablesInsert, TablesUpdate, Enums } from "./database.types";
