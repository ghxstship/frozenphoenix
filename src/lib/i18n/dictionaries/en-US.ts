/* ═══════════════════════════════════════════════════════════════
   EN-US — Canonical English (US) translation dictionary.
   This is the SSOT fallback locale. All other locales fall back
   to values defined here for any missing keys.
   ═══════════════════════════════════════════════════════════════ */

import { AUTH_STRINGS } from "../auth-strings";
import { MESSAGING_STRINGS } from "../messaging-strings";
import { COMMON_STRINGS } from "../common-strings";
import { PRODUCTION_STRINGS } from "../production-strings";
import { FINANCE_STRINGS } from "../finance-strings";
import { CRM_STRINGS } from "../crm-strings";
import { CONTRACTS_STRINGS } from "../contracts-strings";
import { VENDORS_STRINGS } from "../vendors-strings";
import { ASSETS_STRINGS } from "../assets-strings";
import { APPROVALS_STRINGS } from "../approvals-strings";
import { CAMPAIGNS_STRINGS } from "../campaigns-strings";
import { INCIDENTS_STRINGS } from "../incidents-strings";
import { SETTINGS_STRINGS } from "../settings-strings";
import { SCANNING_STRINGS } from "../scanning-strings";
import { CONTEXT_SWITCHER_STRINGS } from "../context-switcher-strings";
import { SHELLS_STRINGS } from "../shells-strings";
import type { TranslationDictionary } from "../types";

export const enUS: TranslationDictionary = {
    auth: AUTH_STRINGS,
    messaging: MESSAGING_STRINGS,
    common: COMMON_STRINGS,
    production: PRODUCTION_STRINGS,
    finance: FINANCE_STRINGS,
    crm: CRM_STRINGS,
    contracts: CONTRACTS_STRINGS,
    vendors: VENDORS_STRINGS,
    assets: ASSETS_STRINGS,
    approvals: APPROVALS_STRINGS,
    campaigns: CAMPAIGNS_STRINGS,
    incidents: INCIDENTS_STRINGS,
    settings: SETTINGS_STRINGS,
    scanning: SCANNING_STRINGS,
    contextSwitcher: CONTEXT_SWITCHER_STRINGS,
    shells: SHELLS_STRINGS,
};
