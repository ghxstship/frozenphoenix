"use client";

import { useFeatureFlag } from "@/lib/settings/settings-provider";
import { MESSAGING_FEATURE_FLAGS } from "@/types/messaging";

/**
 * Feature-flag guard for messaging features.
 * Returns granular boolean flags for each messaging capability.
 * When the master flag is off, all sub-features are disabled.
 */
export function useMessagingEnabled() {
    const messagingEnabled = useFeatureFlag(MESSAGING_FEATURE_FLAGS.MESSAGING_ENABLED);
    const channelsEnabled = useFeatureFlag(MESSAGING_FEATURE_FLAGS.MESSAGING_CHANNELS);
    const threadsEnabled = useFeatureFlag(MESSAGING_FEATURE_FLAGS.MESSAGING_THREADS);
    const reactionsEnabled = useFeatureFlag(MESSAGING_FEATURE_FLAGS.MESSAGING_REACTIONS);
    const mandatoryReadEnabled = useFeatureFlag(MESSAGING_FEATURE_FLAGS.MESSAGING_MANDATORY_READ);
    const scheduledEnabled = useFeatureFlag(MESSAGING_FEATURE_FLAGS.MESSAGING_SCHEDULED);
    const aiSummaryEnabled = useFeatureFlag(MESSAGING_FEATURE_FLAGS.MESSAGING_AI_SUMMARY);
    const voiceEnabled = useFeatureFlag(MESSAGING_FEATURE_FLAGS.MESSAGING_VOICE);

    return {
        messagingEnabled,
        channelsEnabled: messagingEnabled && channelsEnabled,
        threadsEnabled: messagingEnabled && threadsEnabled,
        reactionsEnabled: messagingEnabled && reactionsEnabled,
        mandatoryReadEnabled: messagingEnabled && mandatoryReadEnabled,
        scheduledEnabled: messagingEnabled && scheduledEnabled,
        aiSummaryEnabled: messagingEnabled && aiSummaryEnabled,
        voiceEnabled: messagingEnabled && voiceEnabled,
    };
}
