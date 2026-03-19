/* ═══════════════════════════════════════════════════════════════
   I18N TYPES — Translation dictionary shape.
   Every locale must satisfy this interface.
   ═══════════════════════════════════════════════════════════════ */

import type { AUTH_STRINGS } from "./auth-strings";
import type { MESSAGING_STRINGS } from "./messaging-strings";
import type { COMMON_STRINGS } from "./common-strings";
import type { PRODUCTION_STRINGS } from "./production-strings";
import type { FINANCE_STRINGS } from "./finance-strings";
import type { CRM_STRINGS } from "./crm-strings";
import type { CONTRACTS_STRINGS } from "./contracts-strings";
import type { VENDORS_STRINGS } from "./vendors-strings";
import type { ASSETS_STRINGS } from "./assets-strings";
import type { APPROVALS_STRINGS } from "./approvals-strings";
import type { CAMPAIGNS_STRINGS } from "./campaigns-strings";
import type { INCIDENTS_STRINGS } from "./incidents-strings";
import type { SETTINGS_STRINGS } from "./settings-strings";
import type { SCANNING_STRINGS } from "./scanning-strings";
import type { CONTEXT_SWITCHER_STRINGS } from "./context-switcher-strings";
import type { SHELLS_STRINGS } from "./shells-strings";

/**
 * Master translation dictionary shape.
 * Each namespace maps 1:1 to an existing *_STRINGS constant.
 */
export interface TranslationDictionary {
    auth: typeof AUTH_STRINGS;
    messaging: typeof MESSAGING_STRINGS;
    common: typeof COMMON_STRINGS;
    production: typeof PRODUCTION_STRINGS;
    finance: typeof FINANCE_STRINGS;
    crm: typeof CRM_STRINGS;
    contracts: typeof CONTRACTS_STRINGS;
    vendors: typeof VENDORS_STRINGS;
    assets: typeof ASSETS_STRINGS;
    approvals: typeof APPROVALS_STRINGS;
    campaigns: typeof CAMPAIGNS_STRINGS;
    incidents: typeof INCIDENTS_STRINGS;
    settings: typeof SETTINGS_STRINGS;
    scanning: typeof SCANNING_STRINGS;
    contextSwitcher: typeof CONTEXT_SWITCHER_STRINGS;
    shells: typeof SHELLS_STRINGS;
}

export type TranslationNamespace = keyof TranslationDictionary;

/**
 * A partial dictionary allows locale files to omit keys that
 * should fall back to en-US. Only en-US must be complete.
 * String literal types are widened to `string` so translated values
 * aren't constrained to the English source literals.
 */
export type PartialTranslationDictionary = {
    [K in TranslationNamespace]?: DeepPartialWidened<TranslationDictionary[K]>;
};

/** Deep partial with string literal widening — makes every nested property optional and widens string literals to `string`. */
type DeepPartialWidened<T> = T extends string
    ? string
    : T extends object
      ? { [P in keyof T]?: DeepPartialWidened<T[P]> }
      : T;
