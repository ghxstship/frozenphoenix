/* ═══════════════════════════════════════════════════════════════
   AUTH — Consolidated barrel export
   ═══════════════════════════════════════════════════════════════ */

// Components
export { AuthFormField } from "./components/auth-form-field";
export { AuthLayout } from "./components/auth-layout";
export { BotProtection } from "./components/bot-protection";
export { EmailCollectionBanner } from "./components/email-collection-banner";
export { OAuthButtons } from "./components/oauth-buttons";
export { PasswordInput } from "./components/password-input";

// Hooks & Context
export { AuthProvider, useAuth } from "./hooks/auth-context";
export { logAuthEvent } from "./hooks/auth-audit";

// Utils
export { getBlueskyOAuthClient, BLUESKY_SCOPE } from "./utils/bluesky-client";
