/**
 * OAuth 2.0 Configuration for Provider Integrations (G5)
 *
 * Defines OAuth endpoints, scopes, and token exchange parameters
 * for each supported provider that uses OAuth 2.0.
 */

export interface OAuthProviderConfig {
    providerType: string;
    displayName: string;
    authorizationUrl: string;
    tokenUrl: string;
    scopes: string[];
    clientIdEnvVar: string;
    clientSecretEnvVar: string;
    additionalAuthParams?: Record<string, string>;
    tokenResponseMap?: {
        accessToken?: string;
        refreshToken?: string;
        expiresIn?: string;
    };
}

export const OAUTH_PROVIDERS: Record<string, OAuthProviderConfig> = {
    quickbooks: {
        providerType: "quickbooks",
        displayName: "QuickBooks Online",
        authorizationUrl: "https://appcenter.intuit.com/connect/oauth2",
        tokenUrl: "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
        scopes: ["com.intuit.quickbooks.accounting"],
        clientIdEnvVar: "QUICKBOOKS_CLIENT_ID",
        clientSecretEnvVar: "QUICKBOOKS_CLIENT_SECRET",
        additionalAuthParams: { response_type: "code" },
        tokenResponseMap: {
            accessToken: "access_token",
            refreshToken: "refresh_token",
            expiresIn: "expires_in",
        },
    },
    xero: {
        providerType: "xero",
        displayName: "Xero",
        authorizationUrl: "https://login.xero.com/identity/connect/authorize",
        tokenUrl: "https://identity.xero.com/connect/token",
        scopes: [
            "openid",
            "profile",
            "email",
            "accounting.transactions",
            "accounting.contacts",
            "accounting.settings",
        ],
        clientIdEnvVar: "XERO_CLIENT_ID",
        clientSecretEnvVar: "XERO_CLIENT_SECRET",
        additionalAuthParams: { response_type: "code" },
    },
    slack: {
        providerType: "slack",
        displayName: "Slack",
        authorizationUrl: "https://slack.com/oauth/v2/authorize",
        tokenUrl: "https://slack.com/api/oauth.v2.access",
        scopes: ["chat:write", "channels:read", "incoming-webhook", "commands"],
        clientIdEnvVar: "SLACK_CLIENT_ID",
        clientSecretEnvVar: "SLACK_CLIENT_SECRET",
        tokenResponseMap: {
            accessToken: "access_token",
            refreshToken: "refresh_token",
            expiresIn: "expires_in",
        },
    },
    google_calendar: {
        providerType: "google_calendar",
        displayName: "Google Calendar",
        authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        scopes: [
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/calendar.events",
        ],
        clientIdEnvVar: "GOOGLE_CLIENT_ID",
        clientSecretEnvVar: "GOOGLE_CLIENT_SECRET",
        additionalAuthParams: {
            access_type: "offline",
            prompt: "consent",
            response_type: "code",
        },
    },
    google_drive: {
        providerType: "google_drive",
        displayName: "Google Drive",
        authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        scopes: ["https://www.googleapis.com/auth/drive.file"],
        clientIdEnvVar: "GOOGLE_CLIENT_ID",
        clientSecretEnvVar: "GOOGLE_CLIENT_SECRET",
        additionalAuthParams: {
            access_type: "offline",
            prompt: "consent",
            response_type: "code",
        },
    },
    hubspot: {
        providerType: "hubspot",
        displayName: "HubSpot",
        authorizationUrl: "https://app.hubspot.com/oauth/authorize",
        tokenUrl: "https://api.hubapi.com/oauth/v1/token",
        scopes: [
            "crm.objects.contacts.read",
            "crm.objects.contacts.write",
            "crm.objects.deals.read",
            "crm.objects.companies.read",
        ],
        clientIdEnvVar: "HUBSPOT_CLIENT_ID",
        clientSecretEnvVar: "HUBSPOT_CLIENT_SECRET",
    },
    microsoft_teams: {
        providerType: "microsoft_teams",
        displayName: "Microsoft Teams",
        authorizationUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        scopes: [
            "https://graph.microsoft.com/ChannelMessage.Send",
            "https://graph.microsoft.com/Team.ReadBasic.All",
            "offline_access",
        ],
        clientIdEnvVar: "MICROSOFT_CLIENT_ID",
        clientSecretEnvVar: "MICROSOFT_CLIENT_SECRET",
        additionalAuthParams: { response_type: "code" },
    },
    docusign: {
        providerType: "docusign",
        displayName: "DocuSign",
        authorizationUrl: "https://account-d.docusign.com/oauth/auth",
        tokenUrl: "https://account-d.docusign.com/oauth/token",
        scopes: ["signature", "impersonation"],
        clientIdEnvVar: "DOCUSIGN_CLIENT_ID",
        clientSecretEnvVar: "DOCUSIGN_CLIENT_SECRET",
        additionalAuthParams: { response_type: "code" },
    },
    asana: {
        providerType: "asana",
        displayName: "Asana",
        authorizationUrl: "https://app.asana.com/-/oauth_authorize",
        tokenUrl: "https://app.asana.com/-/oauth_token",
        scopes: [],
        clientIdEnvVar: "ASANA_CLIENT_ID",
        clientSecretEnvVar: "ASANA_CLIENT_SECRET",
        additionalAuthParams: { response_type: "code" },
    },
    jira: {
        providerType: "jira",
        displayName: "Jira",
        authorizationUrl: "https://auth.atlassian.com/authorize",
        tokenUrl: "https://auth.atlassian.com/oauth/token",
        scopes: ["read:jira-work", "write:jira-work", "offline_access"],
        clientIdEnvVar: "JIRA_CLIENT_ID",
        clientSecretEnvVar: "JIRA_CLIENT_SECRET",
        additionalAuthParams: {
            audience: "api.atlassian.com",
            response_type: "code",
            prompt: "consent",
        },
    },
    deputy: {
        providerType: "deputy",
        displayName: "Deputy",
        authorizationUrl: "https://once.deputy.com/my/oauth/login",
        tokenUrl: "https://once.deputy.com/my/oauth/access_token",
        scopes: ["longlife_refresh_token"],
        clientIdEnvVar: "DEPUTY_CLIENT_ID",
        clientSecretEnvVar: "DEPUTY_CLIENT_SECRET",
        additionalAuthParams: { response_type: "code" },
    },
};

/**
 * Get the redirect URI for OAuth callbacks.
 */
export function getOAuthRedirectUri(providerType: string): string {
    const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://atlvs.one");
    const origin = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
    return `${origin}/api/integrations/oauth/callback/${providerType}`;
}

/**
 * Build the full authorization URL for a provider.
 */
export function buildAuthorizationUrl(providerType: string, state: string): string | null {
    const config = OAUTH_PROVIDERS[providerType];
    if (!config) return null;

    const clientId = process.env[config.clientIdEnvVar];
    if (!clientId) return null;

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: getOAuthRedirectUri(providerType),
        scope: config.scopes.join(" "),
        state,
        ...(config.additionalAuthParams ?? {}),
    });

    return `${config.authorizationUrl}?${params.toString()}`;
}

/**
 * Exchange an authorization code for tokens.
 */
export async function exchangeCodeForTokens(
    providerType: string,
    code: string
): Promise<{
    success: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: string;
    scopes?: string[];
    rawResponse?: Record<string, unknown>;
    error?: string;
}> {
    const config = OAUTH_PROVIDERS[providerType];
    if (!config) return { success: false, error: `Unknown provider: ${providerType}` };

    const clientId = process.env[config.clientIdEnvVar];
    const clientSecret = process.env[config.clientSecretEnvVar];

    if (!clientId || !clientSecret) {
        return { success: false, error: `Missing OAuth credentials for ${providerType}` };
    }

    try {
        const body = new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: getOAuthRedirectUri(providerType),
            client_id: clientId,
            client_secret: clientSecret,
        });

        const response = await fetch(config.tokenUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            body: body.toString(),
        });

        if (!response.ok) {
            const errText = await response.text();
            return {
                success: false,
                error: `Token exchange failed (${response.status}): ${errText.slice(0, 500)}`,
            };
        }

        const data = (await response.json()) as Record<string, unknown>;
        const map = config.tokenResponseMap ?? {};

        const accessToken = (data[map.accessToken ?? "access_token"] as string) ?? undefined;
        const refreshToken = (data[map.refreshToken ?? "refresh_token"] as string) ?? undefined;
        const expiresIn = data[map.expiresIn ?? "expires_in"] as number | undefined;

        const expiresAt = expiresIn
            ? new Date(Date.now() + expiresIn * 1000).toISOString()
            : undefined;

        return {
            success: true,
            accessToken,
            refreshToken,
            expiresAt,
            scopes: config.scopes,
            rawResponse: data,
        };
    } catch (err) {
        return { success: false, error: `Token exchange error: ${(err as Error).message}` };
    }
}

/**
 * Refresh an access token using a refresh token.
 */
export async function refreshAccessToken(
    providerType: string,
    refreshToken: string
): Promise<{
    success: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: string;
    error?: string;
}> {
    const config = OAUTH_PROVIDERS[providerType];
    if (!config) return { success: false, error: `Unknown provider: ${providerType}` };

    const clientId = process.env[config.clientIdEnvVar];
    const clientSecret = process.env[config.clientSecretEnvVar];

    if (!clientId || !clientSecret) {
        return { success: false, error: `Missing OAuth credentials for ${providerType}` };
    }

    try {
        const body = new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
        });

        const response = await fetch(config.tokenUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            body: body.toString(),
        });

        if (!response.ok) {
            const errText = await response.text();
            return {
                success: false,
                error: `Token refresh failed (${response.status}): ${errText.slice(0, 500)}`,
            };
        }

        const data = (await response.json()) as Record<string, unknown>;
        const map = config.tokenResponseMap ?? {};

        const accessToken = (data[map.accessToken ?? "access_token"] as string) ?? undefined;
        const newRefreshToken =
            (data[map.refreshToken ?? "refresh_token"] as string) ?? refreshToken;
        const expiresIn = data[map.expiresIn ?? "expires_in"] as number | undefined;

        const expiresAt = expiresIn
            ? new Date(Date.now() + expiresIn * 1000).toISOString()
            : undefined;

        return {
            success: true,
            accessToken,
            refreshToken: newRefreshToken,
            expiresAt,
        };
    } catch (err) {
        return { success: false, error: `Token refresh error: ${(err as Error).message}` };
    }
}
