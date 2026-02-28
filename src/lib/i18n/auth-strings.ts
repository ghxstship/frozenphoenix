/* ═══════════════════════════════════════════════════════════════
   AUTH I18N STRINGS — Single source of truth for auth UI copy.
   Swap this file (or load from a remote catalog) to localise
   every auth-related surface in the application.
   ═══════════════════════════════════════════════════════════════ */

export const AUTH_STRINGS = {
    // ─── Login ──────────────────────────────────────────────────
    login: {
        title: "Welcome back",
        subtitle: "Sign in to your account to continue",
        emailLabel: "Email",
        emailPlaceholder: "you@company.com",
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

    // ─── Signup ─────────────────────────────────────────────────
    signup: {
        title: "Create your account",
        subtitle: "Get started with your production workspace",
        nameLabel: "Full Name",
        namePlaceholder: "Jane Doe",
        emailLabel: "Email",
        emailPlaceholder: "you@company.com",
        passwordLabel: "Password",
        passwordPlaceholder: "••••••••",
        orgNameLabel: "Organization Name",
        orgNamePlaceholder: "Acme Productions",
        submitButton: "Create Account",
        submittingButton: "Creating account…",
        loginPrompt: "Already have an account?",
        loginLink: "Sign in",
        successTitle: "Check your email",
        successMessage: "We sent a confirmation link to {email}. Please check your inbox (and spam folder) to verify your account.",
        serviceUnavailable: "Authentication service unavailable. Please try again later.",
        genericError: "Something went wrong. Please try again.",
    },

    // ─── Forgot Password ────────────────────────────────────────
    forgotPassword: {
        title: "Reset your password",
        subtitle: "Enter your email and we'll send a reset link",
        emailLabel: "Email",
        emailPlaceholder: "you@company.com",
        submitButton: "Send Reset Link",
        submittingButton: "Sending…",
        resendButton: "Resend ({seconds}s)",
        backToLogin: "Back to sign in",
        successTitle: "Check your email",
        successMessage: "If an account exists for {email}, you'll receive a password reset link shortly.",
        serviceUnavailable: "Authentication service unavailable. Please try again later.",
        genericError: "Something went wrong. Please try again.",
    },

    // ─── Reset Password ─────────────────────────────────────────
    resetPassword: {
        title: "Set a new password",
        subtitle: "Choose a strong password for your account",
        newPasswordLabel: "New Password",
        confirmPasswordLabel: "Confirm Password",
        passwordPlaceholder: "••••••••",
        submitButton: "Update Password",
        submittingButton: "Updating…",
        confirmMismatch: "Passwords do not match.",
        successTitle: "Password updated",
        successSubtitle: "Your account is secured with your new password",
        successHeading: "You're all set",
        successMessage: "Your password has been successfully updated. You can now continue to your dashboard.",
        goToDashboard: "Go to Dashboard",
        serviceUnavailable: "Authentication service unavailable. Please try again later.",
        genericError: "Something went wrong. Please try again.",
    },

    // ─── MFA ────────────────────────────────────────────────────
    mfa: {
        setupTitle: "Set up two-factor authentication",
        setupSubtitle: "Add an extra layer of security to your account",
        verifyTitle: "Two-factor authentication",
        verifySubtitle: "Enter the code from your authenticator app",
        scanStep: "Scan this QR code with your authenticator app",
        manualEntry: "Or enter this secret key manually:",
        verifyStep: "Enter the 6-digit code to verify",
        codeLabel: "Verification Code",
        codePlaceholder: "000000",
        codeHint: "Open your authenticator app to view your code.",
        verifyButton: "Verify",
        verifyingButton: "Verifying…",
        verifyAndContinue: "Verify & Continue",
        skipButton: "I'll set this up later",
        switchAccount: "Sign in with a different account",
        invalidCode: "Invalid code. Please check your authenticator app and try again.",
        invalidCodeLength: "Please enter a 6-digit code from your authenticator app.",
        enabledTitle: "MFA enabled",
        enabledSubtitle: "Your account is now more secure",
        enabledHeading: "Two-factor authentication is active",
        enabledMessage: "You'll need your authenticator app each time you sign in.",
        goToDashboard: "Go to Dashboard",
    },

    // ─── OAuth ──────────────────────────────────────────────────
    oauth: {
        continueWith: "Continue with {provider}",
        divider: "or",
    },

    // ─── Invite ─────────────────────────────────────────────────
    invite: {
        loadingTitle: "Loading invitation…",
        loadingSubtitle: "Verifying your invite",
        notFoundTitle: "Invitation not found",
        notFoundMessage: "This invitation link is invalid or has been removed. Please contact your team administrator for a new invite.",
        expiredTitle: "Invitation expired",
        expiredMessage: "This invitation has expired. Please ask your team administrator to send a new invitation.",
        usedTitle: "Already accepted",
        usedMessage: "This invitation has already been accepted. If this was you, sign in to access the organization.",
        acceptedTitle: "Welcome aboard!",
        acceptedSubtitle: "You've joined the team",
        acceptedMessage: "You've joined {org}",
        acceptButton: "Accept & Join Organization",
        acceptingButton: "Joining…",
        createAndJoin: "Create Account & Join",
        signInAndJoin: "Sign In & Join",
        goToSignIn: "Go to Sign In",
        signIn: "Sign In",
    },

    // ─── Onboarding ─────────────────────────────────────────────
    onboarding: {
        orgSetupTitle: "Set up your organization",
        orgSetupSubtitle: "Let's get your workspace configured.",
        orgNameLabel: "Organization Name",
        orgNamePlaceholder: "Acme Productions",
        industryLabel: "Industry",
        industryPlaceholder: "Select your industry…",
        timezoneLabel: "Default Timezone",
        skipButton: "Skip for now",
        continueButton: "Continue",
        creatingButton: "Creating…",
        orgCreatedTitle: "Organization created!",
        orgCreatedMessage: "Taking you to invite your team…",
        inviteTitle: "Invite your team",
        inviteSubtitle: "Add team members to {org}. You can always invite more people later.",
        addAnother: "Add another",
        messageLabel: "Personal message",
        messageOptional: "(optional)",
        messagePlaceholder: "Hey! Join us on Playbook to collaborate on our upcoming productions.",
        sendButton: "Send Invitations",
        sendingButton: "Sending…",
        sentTitle: "{count} invitation{s} sent!",
        sentMessage: "Your team members will receive an email with a link to join.",
    },

    // ─── Security Settings ──────────────────────────────────────
    security: {
        pageTitle: "Security Settings",
        pageDescription: "Manage your password, two-factor authentication, and active sessions.",
        changePasswordTitle: "Change Password",
        currentPasswordLabel: "Current Password",
        newPasswordLabel: "New Password",
        confirmNewPasswordLabel: "Confirm New Password",
        updatePasswordButton: "Update Password",
        updatingButton: "Updating…",
        passwordUpdated: "Password updated successfully.",
        passwordsMismatch: "New passwords do not match.",
        mfaTitle: "Two-Factor Authentication",
        mfaEnabled: "Two-factor authentication is enabled.",
        mfaPrompt: "Add an extra layer of security to your account with an authenticator app.",
        enableMfaButton: "Enable Two-Factor Auth",
        recentActivityTitle: "Recent Login Activity",
        noActivity: "No recent login activity recorded.",
        accountInfoTitle: "Account Information",
        emailLabel: "Email",
        accountCreatedLabel: "Account created",
        lastSignInLabel: "Last sign in",
    },

    // ─── Shared / Common ────────────────────────────────────────
    common: {
        required: "*",
        loading: "Loading…",
        error: "An unexpected error occurred. Please try again.",
        serviceUnavailable: "Service unavailable. Please try again later.",
        goToDashboard: "Go to Dashboard",
        backToLogin: "Back to sign in",
    },

    // ─── Roles ──────────────────────────────────────────────────
    roles: {
        exec: "Executive",
        pm: "Project Manager",
        client: "Client",
        vendor: "Vendor",
    },
} as const;

export type AuthStringKey = keyof typeof AUTH_STRINGS;
