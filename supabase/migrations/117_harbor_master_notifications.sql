-- ═══════════════════════════════════════════════════════════════════════════
-- HARBOR MASTER — Missing Notification Triggers
-- Migration 117: Complete §8 notification coverage
--
-- Adds:
--   11.6 · Member removed → notify removed user (email + in-app)
--   11.7 · Role changed → notify affected user (in-app)
--   11.8 · Domain auto-join → notify org admins (in-app)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 11.6: MEMBER REMOVED ────────────────────────────────────────────────
-- Fires on DELETE from org_memberships. Notifies the removed user.

CREATE OR REPLACE FUNCTION public.notify_member_removed()
RETURNS TRIGGER AS $$
DECLARE
    org_name TEXT;
BEGIN
    SELECT name INTO org_name
    FROM public.organizations
    WHERE id = OLD.organization_id;

    INSERT INTO public.notifications (user_id, target_user_id, title, message, type)
    VALUES (
        OLD.user_id,
        OLD.user_id,
        'Membership removed',
        'You have been removed from ' || COALESCE(org_name, 'an organization') || '.',
        'warning'
    )
    ON CONFLICT DO NOTHING;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_member_removed ON public.org_memberships;
CREATE TRIGGER trg_notify_member_removed
    AFTER DELETE ON public.org_memberships
    FOR EACH ROW EXECUTE FUNCTION public.notify_member_removed();


-- ─── 11.7: ROLE CHANGED ─────────────────────────────────────────────────
-- Fires on UPDATE of role or role_id in org_memberships.
-- Notifies the affected user when their role changes.

CREATE OR REPLACE FUNCTION public.notify_role_changed()
RETURNS TRIGGER AS $$
DECLARE
    org_name TEXT;
    old_role_name TEXT;
    new_role_name TEXT;
BEGIN
    -- Only fire if role or role_id actually changed
    IF (OLD.role IS DISTINCT FROM NEW.role) OR (OLD.role_id IS DISTINCT FROM NEW.role_id) THEN
        SELECT name INTO org_name
        FROM public.organizations
        WHERE id = NEW.organization_id;

        -- Resolve old role name
        IF OLD.role_id IS NOT NULL THEN
            SELECT name INTO old_role_name FROM public.roles WHERE id = OLD.role_id;
        END IF;
        old_role_name := COALESCE(old_role_name, OLD.role, 'unknown');

        -- Resolve new role name
        IF NEW.role_id IS NOT NULL THEN
            SELECT name INTO new_role_name FROM public.roles WHERE id = NEW.role_id;
        END IF;
        new_role_name := COALESCE(new_role_name, NEW.role, 'unknown');

        INSERT INTO public.notifications (user_id, target_user_id, title, message, type)
        VALUES (
            NEW.user_id,
            NEW.user_id,
            'Role updated',
            'Your role in ' || COALESCE(org_name, 'an organization')
                || ' has been changed from ' || old_role_name
                || ' to ' || new_role_name || '.',
            'info'
        )
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_role_changed ON public.org_memberships;
CREATE TRIGGER trg_notify_role_changed
    AFTER UPDATE ON public.org_memberships
    FOR EACH ROW EXECUTE FUNCTION public.notify_role_changed();


-- ─── 11.8: DOMAIN AUTO-JOIN → NOTIFY ORG ADMINS ─────────────────────────
-- Fires when a new membership is created via domain_match auto-join.
-- Notifies all exec/director/pm members in the org about the new user.

CREATE OR REPLACE FUNCTION public.notify_domain_auto_join()
RETURNS TRIGGER AS $$
DECLARE
    approver RECORD;
    org_name TEXT;
    user_email TEXT;
BEGIN
    -- Only fire for domain_match joins
    IF NEW.joined_via = 'domain_match' AND NEW.status = 'active' THEN
        SELECT name INTO org_name FROM public.organizations WHERE id = NEW.organization_id;
        SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;

        FOR approver IN
            SELECT DISTINCT m.user_id
            FROM public.org_memberships m
            WHERE m.organization_id = NEW.organization_id
              AND m.status = 'active'
              AND m.role IN ('exec', 'director', 'pm')
              AND m.user_id != NEW.user_id
        LOOP
            INSERT INTO public.notifications (user_id, target_user_id, title, message, type)
            VALUES (
                approver.user_id,
                approver.user_id,
                'New member via domain match',
                COALESCE(user_email, 'A user') || ' has automatically joined '
                    || COALESCE(org_name, 'your organization') || ' via domain matching.',
                'info'
            )
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_domain_auto_join ON public.org_memberships;
CREATE TRIGGER trg_notify_domain_auto_join
    AFTER INSERT ON public.org_memberships
    FOR EACH ROW EXECUTE FUNCTION public.notify_domain_auto_join();
