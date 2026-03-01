-- Migration 025: Seed default organization and onboarding step definitions
-- Ensures the handle_new_user trigger always has a default org to assign,
-- and provides onboarding step templates for all roles.
--
-- IDEMPOTENCY: All INSERTs use ON CONFLICT DO NOTHING.
-- PRODUCTION NOTE: This seed is safe for all environments.
-- For production, override the default org via the org-setup onboarding flow.
-- The default org acts as a placeholder until the exec creates their real org.

-- ─── Guarantee default organization exists ─────────────────────
INSERT INTO organizations (name, slug)
VALUES ('Default Organization', 'default')
ON CONFLICT (slug) DO NOTHING;

-- ─── Seed onboarding step definitions ──────────────────────────
-- These are role-scoped templates. 'all' applies to every role.
-- gate_access = true means the user cannot proceed past this step.
DO $$
BEGIN
    -- Only seed if the table exists (created in migration 018)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'onboarding_step_definitions'
    ) THEN
        INSERT INTO onboarding_step_definitions (role, step_key, title, description, sort_order, is_required, gate_access) VALUES
            ('all',    'verify_email',        'Verify your email',            'Confirm your email address to activate your account.',                  1, true,  true),
            ('all',    'complete_profile',     'Complete your profile',        'Add your name, avatar, and timezone.',                                 2, true,  false),
            ('exec',   'setup_organization',   'Set up your organization',     'Configure your organization name, logo, and settings.',                3, true,  false),
            ('exec',   'invite_team',          'Invite your team',             'Send invitations to your team members.',                               4, false, false),
            ('exec',   'configure_billing',    'Configure billing',            'Set up your subscription and payment method.',                         5, false, false),
            ('pm',     'create_first_project', 'Create your first project',    'Set up your first production project.',                                3, false, false),
            ('pm',     'assign_team',          'Assign team members',          'Add crew and collaborators to your project.',                          4, false, false),
            ('client', 'review_deliverables',  'Review pending deliverables',  'Check and approve any deliverables awaiting your review.',             3, false, false),
            ('client', 'set_preferences',      'Set notification preferences', 'Configure how and when you receive updates.',                         4, false, false),
            ('vendor', 'complete_compliance',   'Complete compliance checklist', 'Submit required compliance documents and certifications.',           3, true,  true),
            ('vendor', 'review_assignments',    'Review your assignments',      'View work orders and tasks assigned to you.',                        4, false, false),
            ('all',    'explore_dashboard',     'Explore the dashboard',        'Take a quick tour of the key features available to you.',             10, false, false)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
