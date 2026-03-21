# Messaging & Communications — Detailed Implementation Plan

> **Version:** 1.0 | **Date:** 2026-03-06  
> **Parent:** `docs/MESSAGING_COMMUNICATIONS_COMPETITIVE_AUDIT.md`  
> **Scope:** Phase 1–5 (22 weeks), ~120 work items  
> **Stack:** Next.js 15, Supabase (Postgres + Realtime + Storage + Edge Functions), TailwindCSS, React Query, Zustand  

---

## 1. Decision Log

| # | Decision | Impact on Plan |
|---|---------|---------------|
| D1 | **Hybrid UI: slide-over panel + `/messages` route** | Sprint 2 builds `MessagingPanel` slide-over + Zustand provider. `/messages` full-page in Sprint 3. |
| D2 | **Unlimited history, 60 msg/min rate limit** | No storage cap. Rate limit in API route. Use `data_retention_policies` for compliance purging. |
| D3 | **Voice messages Phase 3, PTT Phase 5** | Voice recording (MediaRecorder) ships Sprint 10. PTT/walkie-talkie deferred to Phase 5 with LiveKit. |
| D4 | **LiveKit Cloud initially** | No self-hosted infra. Env vars: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`. |
| D5 | **Anthropic Claude, provider-abstracted** | Sprint 15: `LLMProvider` interface. Edge Function calls Claude. Feature-flag gated per org. |
| D6 | **SMS via Twilio, emergency/critical only** | Sprint 12: `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_FROM_NUMBER`. |
| D7 | **Unify `record_comments` → `messages`** | Sprint 1 migration creates unified `messages`. Data migration from `record_comments`. `CommentsSection` rewired. |
| D8 | **Lasso: integrate staffing data only** | Sprint 8: add to `integrations` provider list. Crew roster import feeds shift/credential tables. |

---

## 2. Phase 1 — Messaging Foundation (Weeks 1–4)

### Sprint 1: Schema + Core API (Week 1)

#### 2.1.1 Migration: `043_messaging_foundation.sql`

**New tables:**

**`conversations`** — DMs, groups, channels:
- `id`, `organization_id` (FK organizations), `type` ENUM('dm','group','channel')
- `name`, `description`, `slug` (UNIQUE per org), `is_public`, `is_announcement_only`, `is_archived`, `category`
- `event_id` (FK live_event_instances), `project_id` (FK projects) — entity linking
- `required_credential_type`, `is_ephemeral`, `template_id` — Phase 2 columns (nullable)
- `last_message_at`, `message_count`, `created_by`, timestamps
- Indexes: org, type, event, project, last_message_at DESC

**`conversation_members`** — membership + read state:
- `conversation_id` (FK), `user_id` (FK profiles), `role` ENUM('owner','admin','member','guest')
- `last_read_at`, `last_read_message_id`, `notification_preference` CHECK('all','mentions','none')
- `is_muted`, `is_pinned`, `joined_at`
- UNIQUE(conversation_id, user_id). Indexes: user, conversation, unread

**`messages`** — unified table (replaces `record_comments` + new chat):
- `id`, `conversation_id` (FK, nullable), `sender_id` (FK profiles)
- `parent_message_id` (FK self), `thread_message_count`, `thread_last_reply_at`
- `body`, `body_html`, `mentioned_user_ids UUID[]`, `attachments JSONB`
- `entity_type`, `entity_id` — for record-scoped messages (conversation_id IS NULL)
- `is_pinned`, `pinned_by`, `pinned_at`, `is_internal`, `priority` ENUM, `is_mandatory_read`
- `scheduled_at`, `is_system_message`, `edited_at`, `deleted_at` (soft delete)
- `search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(body, ''))) STORED`
- GIN index on search_vector. Indexes: conversation+created_at, sender, thread, entity, scheduled, pinned

**`message_reactions`** — emoji reactions:
- `message_id`, `user_id`, `emoji`. UNIQUE(message_id, user_id, emoji)

**`message_read_receipts`** — per-message read tracking:
- `message_id`, `user_id`, `read_at`. PK(message_id, user_id)

**`mandatory_read_acknowledgments`** — safety briefing acks:
- `message_id`, `user_id`, `acknowledged_at`, `escalated_at`, `escalation_level` (0-3)

**RLS policies:**
- Conversations: SELECT if member OR (is_public AND same org). INSERT if same org. UPDATE if owner/admin.
- Messages: SELECT if conversation member OR (entity-scoped AND same org). INSERT if sender=auth.uid. UPDATE if sender=auth.uid.
- Reactions/receipts/acks: own-row access.

**Realtime:** Add `messages`, `message_reactions`, `conversation_members` to `supabase_realtime` publication.

**Trigger:** `update_conversation_on_message()` — on message INSERT, update `conversations.last_message_at` + `message_count`. If threaded, update parent `thread_message_count`.

**Data migration:** INSERT INTO messages FROM record_comments (id, author_id→sender_id, parent_comment_id→parent_message_id, body, mentioned_user_ids, attachments, entity_type, entity_id, is_internal, organization_id, timestamps).

**Effort:** 1 day

#### 2.1.2 TypeScript Types

**File:** `src/types/messaging.ts`

Types: `ConversationType`, `ConversationRole`, `MessagePriority`, `NotificationPreference`, `Conversation`, `ConversationMember`, `Message`, `MessageAttachment`, `MessageReaction`, `ReactionAggregate`, `MessageReadReceipt`, `ConversationListItem` (extends Conversation with unread_count + last_message preview + members), `SendMessagePayload`.

**Effort:** 0.5 days

#### 2.1.3 API Routes (9 routes)

| Route | Methods | Purpose |
|-------|---------|---------|
| `POST/GET /api/conversations` | GET: list user's conversations. POST: create DM/group/channel (auto-adds creator as owner, finds existing 1:1 for DMs) |
| `GET/PATCH/DELETE /api/conversations/[id]` | Get/update/archive conversation |
| `GET/POST /api/conversations/[id]/messages` | Cursor-based pagination. POST: rate limit 60/min, parse @mentions, dispatch notifications |
| `GET/POST/DELETE /api/conversations/[id]/members` | List/add/remove members |
| `PATCH/DELETE /api/messages/[id]` | Edit (set edited_at) / soft-delete |
| `POST/DELETE /api/messages/[id]/reactions` | Toggle reaction |
| `POST/DELETE /api/messages/[id]/pin` | Pin/unpin (pm+ role check) |
| `POST /api/messages/[id]/read` | Mark read + update conversation_members.last_read_at |
| `GET /api/messages/entity` | Record-scoped messages (?entity_type=X&entity_id=Y) |

**Effort:** 3 days

#### 2.1.4 Hooks + Realtime

**File:** `src/lib/supabase/hooks-messaging.ts`

**Query hooks:** `useConversations()`, `useConversation(id)`, `useConversationMembers(id)`, `useMessages(conversationId, cursor?)`, `useEntityMessages(entityType, entityId)`, `useThreadMessages(parentId)`, `useUnreadCounts()`

**Mutation hooks:** `useCreateConversation()`, `useUpdateConversation()`, `useSendMessage()` (optimistic), `useEditMessage()`, `useDeleteMessage()`, `usePinMessage()`, `useToggleReaction()`, `useMarkRead()`, `useAcknowledgeMandatoryRead()`

**Realtime hooks:** `useMessagesRealtime(conversationId)` — postgres_changes on messages table. `useConversationsRealtime()` — conversation updates. `useTypingIndicator(conversationId)` — Supabase Broadcast (ephemeral, no DB). `usePresence()` — Supabase Presence for online/offline.

**Effort:** 3 days

---

### Sprint 2: Core UI + Slide-Over Panel (Week 2)

#### 2.2.1 Messaging Provider (Zustand)

**File:** `src/hooks/use-messaging.ts`

State: `isPanelOpen`, `activeConversationId`, `activeThreadId`, `composerEntityContext: { type, id }`, `draftMessages: Record<string, string>`.

Actions: `openPanel(conversationId?)`, `closePanel()`, `openThread(messageId)`, `closeThread()`, `setEntityContext(type, id)`, `setDraft(conversationId, text)`.

**Effort:** 0.5 days

#### 2.2.2 UI Components (12 components)

**Directory:** `src/components/messaging/`

| Component | File | Responsibility | Size |
|-----------|------|---------------|------|
| `MessagingPanel` | `messaging-panel.tsx` | Slide-over shell (400px desktop, full mobile). Contains ConversationList or active conversation. | M |
| `ConversationList` | `conversation-list.tsx` | Scrollable list with unread badges, search, "New" button. | M |
| `ConversationListItem` | `conversation-list-item.tsx` | Avatar(s), name, last message preview, timestamp, unread badge. | S |
| `ConversationHeader` | `conversation-header.tsx` | Name, member count, pin/mute/archive actions, members popover, back button. | S |
| `MessageList` | `message-list.tsx` | IntersectionObserver infinite scroll. Auto-scroll on new. Date separators. Unread marker. | L |
| `MessageBubble` | `message-bubble.tsx` | Avatar, name, timestamp, body (markdown), attachments, reactions bar, thread badge, action menu. | L |
| `MessageComposer` | `message-composer.tsx` | Text input, markdown preview, @mention trigger, file attach, send (Cmd+Enter). Entity context badge. | L |
| `MentionAutocomplete` | `mention-autocomplete.tsx` | Dropdown on `@`, lists conversation members, filters. | M |
| `ReactionPicker` | `reaction-picker.tsx` | Quick reactions: ✅ 👍 🔧 ⚠️ 🎯 🔴 + full picker. | S |
| `NewConversationDialog` | `new-conversation-dialog.tsx` | Create DM (user picker), group (multi-user + name), channel (name, slug, category, public/private). | M |
| `MessagingButton` | `messaging-button.tsx` | "Message" button for detail pages. Calls setEntityContext + openPanel. | S |
| `index.ts` | `index.ts` | Barrel export. | — |

**Effort:** 5 days (2 engineers)

#### 2.2.3 Shell Integration

| File | Change |
|------|--------|
| `src/app/(dashboard)/layout.tsx` | Add `<MessagingPanel />` + `MessagingProvider` to provider stack |
| `src/components/layouts/topbar.tsx` | Add MessageSquare icon with unread badge. Click opens panel. |
| `src/components/activity/comments-section.tsx` | Rewire to `useEntityMessages()` instead of props-based comments |
| `src/components/activity/record-chatter.tsx` | Update Comments tab for rewired CommentsSection |
| 8 canonical detail pages | Add `<MessagingButton>` to headers |

**Effort:** 2.5 days

---

### Sprint 3: Threads + Reactions + Pinning + `/messages` (Week 3)

| Work Item | Details | Effort |
|-----------|---------|--------|
| **ThreadPanel** | `thread-panel.tsx` — sub-panel within MessagingPanel. Parent message at top, replies below. Own composer with parent_message_id. | 2d |
| **Reactions** | ReactionPicker on hover/click. `useToggleReaction()` optimistic. Aggregate display: emoji + count. | 1d |
| **Pinning** | Pin/unpin from action menu (pm+). Pinned messages panel via ConversationHeader. | 0.5d |
| **`/messages` route** | `src/app/(dashboard)/messages/page.tsx` — 3-column layout: list \| messages \| thread. URL state: `?c=<id>&t=<threadId>`. Add to navigation.ts. | 1.5d |

---

### Sprint 4: Channels + Read Receipts + Scheduled + @Mentions (Week 4)

| Work Item | Details | Effort |
|-----------|---------|--------|
| **Channel browser** | `channel-browser.tsx` — list public channels, search, filter by category, join/leave. Channel categories added to `domain-config.ts`: production, safety, logistics, client, creative, general. | 2d |
| **Read receipts** | `useMarkRead()` called via IntersectionObserver on last message. Unread count: `messages.created_at > conversation_members.last_read_at`. "Read by N" display on DMs. | 1.5d |
| **Scheduled messages** | `scheduled_at` field on composer (date picker). Edge Function `supabase/functions/publish-scheduled-messages/index.ts` runs every minute via pg_cron. | 1.5d |
| **@Mention dispatch** | MentionAutocomplete resolves @name → user_id. On send: call existing `/api/notifications/dispatch` per mentioned user. | 1.5d |

### Phase 1 Totals

**~28 new files, ~7 modified files. Team: 2 engineers × 4 sprints.**

**Exit criteria:** DMs, group chats, channels, threads, reactions, pinning, read receipts, @mentions, scheduled messages functional. CommentsSection reads from unified messages table. Slide-over + full-page route working.

---

## 3. Phase 2 — Production-Aware Messaging (Weeks 5–8)

### Sprint 5: Event Channels + Templates + RBAC (Week 5)

**Migration: `044_messaging_production.sql`**

**`channel_templates`** table: `organization_id`, `name`, `event_type` ('festival','corporate','broadcast','activation'), `channels_config JSONB` (array of: name, slug, category, is_public, is_announcement_only, is_restricted, required_role, required_credential_type).

**Event-lifecycle provisioning:**
- `POST /api/events/[id]/channels` — reads template, creates conversations with `event_id` linked, auto-adds crew from `live_crew_assignments`, sets `is_ephemeral = true`.
- On event status → 'completed': auto-archive event channels.

**RBAC extension** — add to `src/config/rbac.ts`:
- `messaging:channel:create` (pm+), `messaging:channel:archive` (director+)
- `messaging:message:pin` (pm+), `messaging:announcement:send` (director+)
- `messaging:mandatory_read:create` (director+), `messaging:export` (pm+)

**Effort:** 5 days

### Sprint 6: Shift-Gating + Credentials + Mandatory Read (Week 6)

**Shift-gated routing** (extend messages API POST):
- On message in event channel: query `crew_shifts WHERE event_id AND status='active' AND shift covers NOW()`
- On-shift → real-time push. Off-shift → digest.

**Credential-linked channels:**
- Edge Function `credential-channel-sync` — on credential_assignments change, add/remove members from conversations with matching `required_credential_type`.

**Mandatory read:**
- `MandatoryReadBanner` component, `AcknowledgeButton` on messages, `MandatoryReadDashboard` (director+: % acknowledged, pending list).
- Escalation Edge Function (cron 15min): 15min→reminder, 30min→notify manager, 60min→SMS (Phase 3).

**Effort:** 7 days

### Sprint 7: Vendor Isolation + Cue Triggers + Incident Threads (Week 7)

**Vendor/client isolation:**
- Collaborator: only contracted-event channels. Client: only `category='client'` channels.
- Time-boxed: `shouldRevokeAccess()` applied to conversation membership.

**Cue triggers:** Edge Function `cue-to-channel` — on `ros_cues` EXECUTE → post system message to department channel, @mention dept head.

**Incident threads:** Edge Function `incident-to-thread` — on incidents INSERT → post to safety channel, create mandatory_read_acknowledgments for safety team.

**Effort:** 5.5 days

### Sprint 8: Radio Twin + Ephemeral Lifecycle + Lasso Stub (Week 8)

**Radio digital twin:** Link `comm_channels` → `conversations` via FK. Merge `comm_log_entries` into conversation timeline. `RadioChannelIndicator` badge.

**Ephemeral lifecycle:** Edge Function `archive-event-channels` — on event close: export PDF/CSV to Storage, archive conversations, apply retention policies.

**Lasso stub:** Add to integrations provider list. Stub sync API route.

**Effort:** 5 days

### Phase 2 Totals

**~12 new files, ~8 modified files. Team: 2 engineers × 4 sprints.**

---

## 4. Phase 3 — Field Operations (Weeks 9–12)

### Sprint 9–10: PWA + Offline + Push + Voice (Weeks 9–10)

| Work Item | Effort |
|-----------|--------|
| Service Worker (Workbox) + app manifest + install prompt | 2.5d |
| Offline message queue (`src/lib/messaging/offline-queue.ts` — IndexedDB via idb-keyval, outbox UI, sync on reconnect) | 3d |
| Web Push (`/api/push/subscribe` route + Edge Function `send-push` + VAPID keys) | 3d |
| Voice message recorder (`voice-recorder.tsx` — MediaRecorder → Storage → auto-transcribe via Deepgram/Whisper Edge Fn) | 3d |

**npm:** `workbox-webpack-plugin`, `idb-keyval`, `web-push`  
**Env vars:** `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `DEEPGRAM_API_KEY`

### Sprint 11: Presence + Status + Low-Bandwidth (Week 11)

| Work Item | Effort |
|-----------|--------|
| Network quality hook (`use-network-quality.ts` — Navigator.connection, tiers: full/limited/minimal/offline) | 1d |
| Adaptive rendering (full→images, limited→thumbnails, minimal→text-only, offline→queue) | 1.5d |
| Presence (`use-presence.ts` — Supabase Realtime Presence: user_id, status, zone_id, last_seen) | 2d |
| Custom status (`user-status.tsx` — emoji+text, auto from shift schedule + zone. DB: add status columns to profiles) | 2d |

### Sprint 12: DND + SMS + Digest + Kiosk (Week 12)

| Work Item | Effort |
|-----------|--------|
| DND + shift-scheduled DND (manual toggle, auto from crew_shifts, emergency override. DB: dnd columns on profiles) | 2d |
| SMS fallback (Edge Function `sms-fallback` — Twilio, emergency/critical only) | 1.5d |
| Notification digest (Edge Function cron — hourly/shift-end summary email) | 2d |
| Kiosk mode (`/kiosk` page — PIN/QR login, assigned channels only, auto-logout 5min idle) | 2d |

**Env vars:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`

### Phase 3 Totals

**~15 new files, ~6 modified. Team: 2 engineers + 1 mobile specialist × 4 sprints.**

---

## 5. Phase 4 — Intelligence & Automation (Weeks 13–16)

### Sprint 13: Search (Week 13)

- **Search API** (`/api/messages/search`) — Postgres `ts_query` on `messages.search_vector`. Filters: conversation, date, sender, has:file, entity_type. Cross-entity: include `comm_log_entries`. (3d)
- **Search UI** (`message-search.tsx`) — search bar, results with preview + context. Click navigates to message. (2d)

### Sprint 14: Automation + Escalation (Week 14)

- **Status→Channel** Edge Function (`entity-status-to-channel`) — on entity status change → post system message to linked conversation. Configurable per entity type. (2.5d)
- **Escalation engine** Edge Function (`escalation-engine`) — configurable rules: unread critical → 15min re-push → 30min manager → 60min SMS. Rules in `settings` table. (3d)

### Sprint 15: AI Summarization (Week 15)

- **LLM Provider** (`src/lib/ai/llm-provider.ts`) — interface with `summarize()`, `translate()`. Claude impl + OpenAI fallback. (1d)
- **Summarize Edge Function** (`summarize-channel`) — input: conversation + since. Strip PII. Call Claude. Return: decisions, action items, open questions. Cache. (2.5d)
- **"Catch me up" UI** (`catch-me-up.tsx`) — button in conversation header → loading → summary card. (1d)
- **Shift handoff summary** — auto-trigger on shift change from crew_shifts. Post as system message. (1.5d)

**Env vars:** `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`

### Sprint 16: Translation + Export (Week 16)

- **Translation** Edge Function (`translate-message`) — on-demand per message. Auto-translate option per user. Same LLM provider. UI: "Translate" button on MessageBubble. (3d)
- **Export** (`/api/conversations/[id]/export`) — CSV or PDF. Metadata: timestamps, read receipts, entity links. Per-event or per-channel. (2d)

### Phase 4 Totals

**~10 new files, ~4 modified. Team: 2 engineers + 1 AI/ML × 4 sprints.**

---

## 6. Phase 5 — Audio/Video & Advanced (Weeks 17–22)

### Sprint 17: Voice + Video Messages (Week 17)

- Video recorder (`video-recorder.tsx` — ≤60s clips, thumbnail gen, Storage upload). (2d)
- Unified media player (`media-player.tsx` — audio/video, playback speed). (1.5d)

### Sprint 18–20: Push-to-Talk + Walkie-Talkie (Weeks 18–20)

- LiveKit client setup (`src/lib/livekit/client.ts`) + token Edge Function. (3d)
- PTT UI (`push-to-talk.tsx` — hold-to-talk, channel selector matching comm_channels, "who's talking" indicator). (4d)
- Walkie-talkie mode (`/live-ops/comms/walkie-talkie/page.tsx` — full-screen PTT, channel grid, priority interrupt). (4d)
- Audio recording → Storage → transcribe → `comm_log_entries`. (2d)

### Sprint 21–22: Calls + Screen Share (Weeks 21–22)

- 1:1 voice/video calls (`call-interface.tsx` — LiveKit peer-to-peer, ring notification). (3d)
- Group calls (multi-participant SFU, up to 25). (2d)
- Screen sharing (LiveKit native). (1d)
- Call recording → Storage → transcribe → link to conversation. (2d)

**npm:** `livekit-client`, `@livekit/components-react`  
**Env vars:** `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`

### Phase 5 Totals

**~10 new files, ~3 modified. Team: 2 engineers + 1 WebRTC specialist × 6 sprints.**

---

## 7. Cross-Cutting Concerns

### 7.1 RBAC Permission Matrix

| Resource | exec | director | pm | member | client | collaborator |
|----------|------|----------|-----|--------|--------|-------------|
| `messaging:dm:send` | ✅ | ✅ | ✅ | ✅ | ✅ (assigned PM) | ✅ (assigned PM) |
| `messaging:group:create` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `messaging:channel:create` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `messaging:channel:archive` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `messaging:message:pin` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `messaging:message:delete_others` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `messaging:announcement:send` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `messaging:mandatory_read:create` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `messaging:export` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `messaging:ptt` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

### 7.2 Accessibility (WCAG 2.2 AA)

- `MessageList`: `role="log"`, `aria-live="polite"`, `aria-label` per message
- `MessageComposer`: `role="textbox"`, `aria-describedby` for mention autocomplete
- `ReactionPicker`: keyboard-navigable grid, `role="grid"`, roving tabindex
- `ThreadPanel`: focus management on open/close
- `PTT button`: `aria-pressed`, `aria-label="Push to talk"`
- Unread badges: `aria-label="N unread messages"`

### 7.3 i18n

New file `src/lib/i18n/messaging-strings.ts` — ~60 strings following `auth-strings.ts` pattern.

### 7.4 Feature Flags

All features gated via `feature_flags` table (migration 027):

`messaging_enabled`, `messaging_channels_enabled`, `messaging_ptt_enabled`, `messaging_voice_messages`, `messaging_ai_summary`, `messaging_mandatory_read`, `messaging_sms_fallback`, `messaging_translation` — all org-scoped, default `false`.

### 7.5 Testing

| Layer | Tool | Target |
|-------|------|--------|
| Migration | `supabase db reset` | All apply cleanly |
| API routes | Vitest + supertest | Auth, validation, RBAC, happy/error paths |
| Hooks | Vitest + RTL | Query/mutation with mock Supabase |
| Components | Vitest + RTL + axe-core | Render, interaction, a11y |
| E2E | Playwright | DM flow, channel, thread, reaction, mention, search |
| Realtime | Playwright multi-tab | Message delivery, typing, presence |
| Offline | Playwright offline mode | Queue → reconnect → sync |

---

## 8. Dependency Map

```
Phase 1 (Foundation) ─────────────────────────────────────
  Sprint 1: Schema + API + Hooks
    └─ Sprint 2: UI + Shell Integration
         ├─ Sprint 3: Threads + Reactions + /messages
         └─ Sprint 4: Channels + Receipts + Mentions

Phase 2 (Production) ─── requires Phase 1 ────────────────
  Sprint 5: Event Channels + Templates + RBAC
    └─ Sprint 6: Shift-Gating + Credentials + Mandatory Read
         └─ Sprint 7: Vendor Isolation + Cue + Incident
              └─ Sprint 8: Radio Twin + Ephemeral + Lasso

Phase 3 (Field Ops) ─── requires Phase 1 (parallel w/ Phase 2)
  Sprint 9-10: PWA + Offline + Push + Voice
    └─ Sprint 11: Presence + Status + Low-Bandwidth
         └─ Sprint 12: DND + SMS + Digest + Kiosk

Phase 4 (Intelligence) ─── requires Phase 1 + Phase 3 voice
  Sprint 13: Search
    └─ Sprint 14: Automation + Escalation
         └─ Sprint 15: AI Summarization
              └─ Sprint 16: Translation + Export

Phase 5 (Audio/Video) ─── requires Phase 1 + Phase 3
  Sprint 17: Voice + Video Messages
    └─ Sprint 18-20: PTT + Walkie-Talkie [LiveKit]
         └─ Sprint 21-22: Calls + Screen Share
```

**Phase 2 and Phase 3 can run in parallel** with two teams after Phase 1.

---

## 9. Risk Register

| # | Risk | Prob | Impact | Mitigation |
|---|------|------|--------|-----------|
| R1 | Supabase Realtime scaling at 500+ concurrent users/event | Med | High | Load test at Phase 1 exit. Fallback: Redis pub/sub or Realtime multiplexing. |
| R2 | Offline sync conflicts (same thread, multiple devices) | Med | Med | Server timestamp wins. "Sent while offline" indicator. |
| R3 | RLS performance on messages with millions of rows | Low | High | Partition by organization_id. Composite index (org, conversation, created_at). Monitor pg_stat. |
| R4 | LiveKit Cloud latency for PTT (<200ms required) | Low | High | Test in target regions. Fallback: deploy LiveKit server co-located with Supabase. |
| R5 | Voice transcription cost at scale | Med | Med | ~$0.006/min. 100 msgs × 30s = $0.30/event. Cap 5min/msg. |
| R6 | iOS Safari Web Push reliability | High | Med | Requires PWA installed (iOS 16.4+). In-app notification center as primary. |
| R7 | LLM latency for summarization | Med | Low | Async (user-triggered, not real-time). Show loading state. Cache per conversation+window. |
| R8 | record_comments → messages migration data integrity | Low | High | Run migration on staging first. Verify row counts. Keep record_comments as backup for 30 days. |

---

## 10. Environment Variables Summary

| Phase | Variable | Service |
|-------|---------|---------|
| 1 | (none — uses existing Supabase) | — |
| 3 | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Web Push |
| 3 | `DEEPGRAM_API_KEY` or `OPENAI_API_KEY` | Voice transcription |
| 3 | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` | SMS fallback |
| 4 | `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` (fallback) | AI summarization |
| 5 | `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` | Voice/video |

---

## 11. npm Additions

| Phase | Package | Purpose | Size |
|-------|---------|---------|------|
| 3 | `workbox-webpack-plugin` | Service Worker tooling | dev only |
| 3 | `idb-keyval` | IndexedDB wrapper for offline queue | ~1KB |
| 3 | `web-push` | Web Push protocol (Edge Function only) | server only |
| 5 | `livekit-client` | WebRTC client SDK | ~50KB |
| 5 | `@livekit/components-react` | LiveKit React UI components | ~30KB |

---

## 12. Total Effort Summary

| Phase | Weeks | New Files | Modified Files | Engineers | Key Deliverable |
|-------|-------|-----------|---------------|-----------|----------------|
| 1 | 1–4 | ~28 | ~7 | 2 | DMs, channels, threads, reactions, slide-over + full page |
| 2 | 5–8 | ~12 | ~8 | 2 | Event channels, shift/credential gating, cue/incident triggers |
| 3 | 9–12 | ~15 | ~6 | 2+1 | PWA, offline, push, voice messages, presence, DND |
| 4 | 13–16 | ~10 | ~4 | 2+1 | Search, AI summaries, escalation, translation, export |
| 5 | 17–22 | ~10 | ~3 | 2+1 | PTT, walkie-talkie, voice/video calls |
| **Total** | **22 wks** | **~75** | **~28** | **2-3** | **Full messaging platform** |
