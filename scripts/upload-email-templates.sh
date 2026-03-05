#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Upload branded email templates to hosted Supabase project
# ═══════════════════════════════════════════════════════════════
#
# Prerequisites:
#   1. Get an access token from https://supabase.com/dashboard/account/tokens
#   2. Set SUPABASE_ACCESS_TOKEN and PROJECT_REF as env vars or pass as args
#
# Usage:
#   export SUPABASE_ACCESS_TOKEN="sbp_xxxx"
#   export PROJECT_REF="abcdefghijklmnop"
#   ./scripts/upload-email-templates.sh
#
#   Or pass inline:
#   SUPABASE_ACCESS_TOKEN=sbp_xxxx PROJECT_REF=abcdef ./scripts/upload-email-templates.sh
#
#   Dry-run (prints payload without sending):
#   DRY_RUN=1 ./scripts/upload-email-templates.sh
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$SCRIPT_DIR/../supabase/templates"

# ─── Validate prerequisites ──────────────────────────────────

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
    echo "ERROR: SUPABASE_ACCESS_TOKEN is not set."
    echo "Get one from https://supabase.com/dashboard/account/tokens"
    exit 1
fi

if [[ -z "${PROJECT_REF:-}" ]]; then
    # Try to extract from NEXT_PUBLIC_SUPABASE_URL (https://<ref>.supabase.co)
    if [[ -n "${NEXT_PUBLIC_SUPABASE_URL:-}" ]]; then
        PROJECT_REF=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed -n 's|https://\([^.]*\)\.supabase\.co.*|\1|p')
    fi
    if [[ -z "${PROJECT_REF:-}" ]]; then
        echo "ERROR: PROJECT_REF is not set and could not be derived from NEXT_PUBLIC_SUPABASE_URL."
        echo "Set it to your Supabase project reference ID (from the project URL)."
        exit 1
    fi
    echo "Derived PROJECT_REF=$PROJECT_REF from NEXT_PUBLIC_SUPABASE_URL"
fi

# ─── Read template files ─────────────────────────────────────

read_template() {
    local file="$TEMPLATE_DIR/$1"
    if [[ ! -f "$file" ]]; then
        echo "WARNING: Template file not found: $file — skipping" >&2
        echo ""
        return
    fi
    cat "$file"
}

CONFIRMATION_HTML=$(read_template "confirmation.html")
RECOVERY_HTML=$(read_template "recovery.html")
MAGIC_LINK_HTML=$(read_template "magic_link.html")
INVITE_HTML=$(read_template "invite.html")
EMAIL_CHANGE_HTML=$(read_template "email_change.html")

# ─── Build JSON payload ──────────────────────────────────────
# Uses jq to properly escape HTML content into JSON strings.

if ! command -v jq &>/dev/null; then
    echo "ERROR: jq is required but not installed. Install with: brew install jq"
    exit 1
fi

PAYLOAD=$(jq -n \
    --arg conf_subject "Confirm your email" \
    --arg conf_content "$CONFIRMATION_HTML" \
    --arg rec_subject "Reset your password" \
    --arg rec_content "$RECOVERY_HTML" \
    --arg ml_subject "Your sign-in link" \
    --arg ml_content "$MAGIC_LINK_HTML" \
    --arg inv_subject "You have been invited" \
    --arg inv_content "$INVITE_HTML" \
    --arg ec_subject "Confirm email change" \
    --arg ec_content "$EMAIL_CHANGE_HTML" \
    '{
        mailer_subjects_confirmation: $conf_subject,
        mailer_templates_confirmation_content: $conf_content,
        mailer_subjects_recovery: $rec_subject,
        mailer_templates_recovery_content: $rec_content,
        mailer_subjects_magic_link: $ml_subject,
        mailer_templates_magic_link_content: $ml_content,
        mailer_subjects_invite: $inv_subject,
        mailer_templates_invite_content: $inv_content,
        mailer_subjects_email_change: $ec_subject,
        mailer_templates_email_change_content: $ec_content
    }')

# ─── Dry-run mode ────────────────────────────────────────────

if [[ "${DRY_RUN:-}" == "1" ]]; then
    echo "DRY RUN — would PATCH https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth"
    echo ""
    echo "Payload (truncated):"
    echo "$PAYLOAD" | jq 'to_entries | map({key, value_length: (.value | length)}) | from_entries'
    exit 0
fi

# ─── Upload ──────────────────────────────────────────────────

echo "Uploading email templates to project $PROJECT_REF..."

HTTP_CODE=$(curl -s -o /tmp/supabase-template-response.json -w "%{http_code}" \
    -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
    -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD")

if [[ "$HTTP_CODE" -ge 200 && "$HTTP_CODE" -lt 300 ]]; then
    echo "✓ Email templates uploaded successfully (HTTP $HTTP_CODE)"
    echo ""
    echo "Templates updated:"
    echo "  • Confirm signup"
    echo "  • Reset password"
    echo "  • Magic link"
    echo "  • Invite user"
    echo "  • Email change"
    echo ""
    echo "Verify at: https://supabase.com/dashboard/project/$PROJECT_REF/auth/templates"
else
    echo "✗ Upload failed (HTTP $HTTP_CODE)"
    echo ""
    cat /tmp/supabase-template-response.json
    exit 1
fi
