/* ═══════════════════════════════════════════════════════════════
   EN-GB — English (UK) translation overrides.
   Only keys that differ from en-US need to be specified.
   ═══════════════════════════════════════════════════════════════ */

import type { PartialTranslationDictionary } from "../types";

export const enGB: PartialTranslationDictionary = {
    common: {
        action_archive: "Archive",
        action_export: "Export",
        action_filter: "Filter",
        confirm_delete_message:
            "Are you sure you want to delete {name}? This action cannot be undone.",
        toast_created: "{entity} created successfully",
        toast_updated: "{entity} updated successfully",
        toast_deleted: "{entity} deleted successfully",
        toast_archived: "{entity} archived successfully",
        toast_copied: "Copied to clipboard",
        form_too_short: "Must be at least {min} characters",
        form_too_long: "Must be at most {max} characters",
        pagination_showing: "Showing {start} to {end} of {total}",
    },
    auth: {
        login: {
            title: "Welcome back",
            subtitle: "Sign in to your account to continue",
            emailLabel: "Email",
            emailPlaceholder: "you@company.co.uk",
            passwordLabel: "Password",
            passwordPlaceholder: "••••••••",
            submitButton: "Sign In",
            submittingButton: "Signing in…",
            forgotPasswordLink: "Forgot password?",
            signupPrompt: "Don't have an account?",
            signupLink: "Sign up",
            rateLimitMessage: "Too many attempts. Try again in {time}.",
            serviceUnavailable: "Authentication service unavailable. Please try again later.",
            genericError: "Something went wrong. Please try again.",
        },
        signup: {
            title: "Create your account",
            subtitle: "Get started with your production workspace",
            firstNameLabel: "First Name",
            firstNamePlaceholder: "Alex",
            lastNameLabel: "Surname",
            lastNamePlaceholder: "Rivera",
            emailLabel: "Email",
            emailPlaceholder: "you@company.co.uk",
            passwordLabel: "Password",
            passwordPlaceholder: "••••••••",
            orgNameLabel: "Organisation Name",
            orgNamePlaceholder: "Acme Productions",
            submitButton: "Create Account",
            submittingButton: "Creating account…",
            loginPrompt: "Already have an account?",
            loginLink: "Sign in",
            successTitle: "Check your email",
            successMessage:
                "We sent a confirmation link to {email}. Please check your inbox (and spam folder) to verify your account.",
            serviceUnavailable: "Authentication service unavailable. Please try again later.",
            genericError: "Something went wrong. Please try again.",
        },
        onboarding: {
            orgSetupTitle: "Set up your organisation",
            orgSetupSubtitle: "Let's get your workspace configured.",
            orgNameLabel: "Organisation Name",
            orgNamePlaceholder: "Acme Productions",
            orgCreatedTitle: "Organisation created!",
            orgCreatedMessage: "Taking you to invite your team…",
        },
        ownership: {
            transferDescription:
                "Transfer organisation ownership to another internal team member. The new owner will gain full administrative control including billing, organisation settings, and the ability to delete the organisation.",
            noEligibleMembers:
                "No eligible team members found. Invite an internal team member before transferring ownership.",
        },
    },
    production: {
        projects_title: "Projects",
        projects_empty: "No projects yet",
        crew_title: "Crew",
        status_cancelled: "Cancelled",
    },
    finance: {
        invoices_title: "Invoices",
        expenses_title: "Expenses",
    },
    incidents: {
        locations_title: "Locations",
        location_state: "County/Region",
    },
    shells: {
        user_organization: "Organisation",
        topbar_help_shortcuts: "Keyboard shortcuts",
    },
};
