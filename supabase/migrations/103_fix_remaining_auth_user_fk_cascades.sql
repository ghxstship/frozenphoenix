-- ═══════════════════════════════════════════════════════════════
-- 103: Fix remaining foreign key cascades to auth.users
-- ═══════════════════════════════════════════════════════════════
-- Migration 094 (transfer_orders, tags, entity_tag_assignments)
-- introduced 5 bare REFERENCES auth.users(id) without ON DELETE,
-- defaulting to RESTRICT. This blocks user deletion from the
-- Supabase dashboard (506: Database error deleting user).
--
-- Strategy: audit/ownership columns → ON DELETE SET NULL
-- ═══════════════════════════════════════════════════════════════

-- 1. transfer_orders.requested_by
ALTER TABLE transfer_orders
  DROP CONSTRAINT IF EXISTS transfer_orders_requested_by_fkey,
  ADD CONSTRAINT transfer_orders_requested_by_fkey
    FOREIGN KEY (requested_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. transfer_orders.approved_by
ALTER TABLE transfer_orders
  DROP CONSTRAINT IF EXISTS transfer_orders_approved_by_fkey,
  ADD CONSTRAINT transfer_orders_approved_by_fkey
    FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. transfer_orders.created_by
ALTER TABLE transfer_orders
  DROP CONSTRAINT IF EXISTS transfer_orders_created_by_fkey,
  ADD CONSTRAINT transfer_orders_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. tags.created_by
ALTER TABLE tags
  DROP CONSTRAINT IF EXISTS tags_created_by_fkey,
  ADD CONSTRAINT tags_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 5. entity_tag_assignments.created_by
ALTER TABLE entity_tag_assignments
  DROP CONSTRAINT IF EXISTS entity_tag_assignments_created_by_fkey,
  ADD CONSTRAINT entity_tag_assignments_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
