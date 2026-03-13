// ═══════════════════════════════════════════════════════════════
// Supabase Integration — Barrel Export
// ═══════════════════════════════════════════════════════════════
// Single import point for all Supabase functionality.
// Usage: import { useDeals, uploadFile, useSignOut } from "@/lib/supabase";

// ─── Configuration ───
export { supabaseUrl, supabaseAnonKey } from "./config";

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

// ─── V2 Feature Hooks ───
export {
    useAutomationExecutions,
    useCreateAutomationExecution,
    useUpdateAutomationExecution,
    useRevenueRecognitionEntries,
    useRevenueRecognitionSummary,
    useCreateRevenueRecognition,
    useTimeTrackingPolicy,
    useUpsertTimeTrackingPolicy,
    useTimeTrackingCompliance,
    useNotifications,
    useUnreadNotificationCount,
    useCreateNotification,
    useMarkNotificationRead,
    useMarkAllNotificationsRead,
    useNotificationPreferences,
    useUpsertNotificationPreference,
    useEmailMessages,
    useCreateEmailMessage,
    useSurveyTemplates,
    useCreateSurveyTemplate,
    useSurveyResponses,
    useCreateSurveyResponse,
    useSlaPolicies,
    useCreateSlaPolicy,
    useSlaStatus,
    useCustomFieldDefinitions,
    useCreateCustomFieldDefinition,
    useUpdateCustomFieldDefinition,
    useCustomFieldValues,
    useUpsertCustomFieldValue,
    useProjectTemplates,
    useCreateProjectTemplate,
    useUpdateProjectTemplate,
    useAiReportQueries,
    useCreateAiReportQuery,
    useGenerateInvoiceFromTime,
    useComplianceDrift,
    useOrgSecuritySettings,
    useUpdateOrgSecuritySettings,
} from "./hooks-v2-features";

// ─── Advancing Hooks ───
export {
    useCatalogCategories,
    useCatalogCategory,
    useCatalogItems,
    useCatalogItemSearch,
    useCatalogItem,
    useCatalogItemModifiers,
    useCatalogOrgOverrides,
    useCatalogOrgOverride,
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

// ─── Credentialing Hooks ───
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

// ─── External Sync & POS Hooks ───
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
    useSyncEvents,
    useUpdateProviderConnection,
    useUpdateSyncConflictPolicy,
    useWebhookEvents,
} from "./hooks-external-sync";

// ─── Messaging Hooks ───
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
    useDeleteMessage,
    useToggleReaction,
    usePinMessage,
    useMarkRead,
    useAcknowledgeMandatoryRead,
    useAddConversationMembers,
    useRemoveConversationMember,
} from "./hooks-messaging";

// ─── Messaging Realtime ───
export {
    useTypingIndicator,
    usePresence,
    useMessagesRealtime,
    useConversationsRealtime,
} from "./hooks-messaging-realtime";

// ─── Approval Engine Hooks ───
export {
    useApprovalInstanceStatus,
    useInitiateApproval,
    useApprovalDecision,
    useEscalateApproval,
    useCancelApproval,
} from "./hooks-approval-engine";

// ─── Context Switcher Hooks ───
export {
    useTeamsForSwitcher,
    useTeamMembers,
    useClientsForSwitcher,
    useProjectsForSwitcher,
    useActivationsForSwitcher,
} from "./hooks-switcher";

// ─── Teams Page Hooks ───
export {
    useTeams,
    useTeamDetail,
    useCreateTeam,
    useUpdateTeam,
    useDeleteTeam,
    useTeamMembersPage,
    useAddTeamMember,
    useRemoveTeamMember,
    useMyDocuments,
} from "./hooks-pages";

// ─── User-Scoped Home Hooks ───
export { useMyTasks, useMyTaskCounts } from "./hooks";

// ─── Live-Ops Hooks ───
export {
    useLiveEventInstances,
    useLiveCrewAssignments,
    useStrikeSequences,
    useEnvironmentalReadings,
    useFohZones,
    useFohZoneReadings,
    useCommChannels,
    useDepartmentStatuses,
    useGuestIncidents,
    useReadinessGates,
    useRosCues,
    useVipGuests,
    useEquipmentCheckIns,
    useLiveFinancialSnapshots,
    usePostEventReports,
} from "./hooks-live-ops";

// ─── Database Types ───
export type { Database, Tables, TablesInsert, TablesUpdate, Enums } from "./database.types";
