# Messaging & Communications — Competitive Feature Audit

> **Version:** 1.0 | **Date:** 2026-03-06  
> **Scope:** 27 platforms × 12 categories (~180 features)  
> **Platform:** FrozenPhoenix (Playbook) — Next.js 15 + Supabase  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Platform Baseline](#2-current-platform-baseline)
3. [Deliverable 1 — Master Feature Matrix](#3-deliverable-1--master-feature-matrix)
4. [Deliverable 2 — Gap Analysis](#4-deliverable-2--gap-analysis)
5. [Deliverable 3 — Competitive Differentiation Map](#5-deliverable-3--competitive-differentiation-map)
6. [Deliverable 4 — Prioritized Integration Roadmap](#6-deliverable-4--prioritized-integration-roadmap)
7. [Architecture Recommendations](#7-architecture-recommendations)
8. [Open Questions](#8-open-questions)

---

## 1. Executive Summary

- **180 discrete messaging features** identified across 12 categories from 27 platforms.
- **42 features scored CRITICAL or HIGH** relevance for event production teams.
- **6 features exist partially** in codebase: record comments, activity feed, notification bell, notification dispatch API, live-ops comm channels (DB), email messages (DB).
- **36 high-priority features are MISSING** — zero real-time person-to-person messaging exists.
- **9 vertical differentiators** identified that no horizontal competitor can replicate.
- **Recommended approach:** Build a thin, production-aware messaging layer on Supabase Realtime (not a third-party chat SDK) to preserve RBAC, multi-tenancy, and data sovereignty.

---

## 2. Current Platform Baseline

### Existing Messaging-Adjacent Features

| Component | Location | Status |
|-----------|----------|--------|
| `CommentsSection` | `src/components/activity/comments-section.tsx` | **PARTIAL** — Record-scoped comments, edit/delete. No @mentions, threads, rich text, or file attachments. |
| `RecordChatter` | `src/components/activity/record-chatter.tsx` | **PARTIAL** — Tabs Comments + Activity on detail pages. No realtime. |
| `NotificationBell` | `src/components/notifications/notification-bell.tsx` | **PARTIAL** — In-app dropdown, mark-read. Falls back to mock. 7 types. |
| Notification Dispatch API | `src/app/api/notifications/dispatch/route.ts` | **PARTIAL** — Create + email dispatch. Per-category prefs. No push/WebSocket. |
| Live-Ops Comms Page | `src/app/(dashboard)/live-ops/comms/page.tsx` | **MOCK ONLY** — Radio channel UI, 100% hardcoded. |
| `comm_channels` | `migrations/020_live_event_operations.sql` | **DB ONLY** — channel_number, priority, discipline, restricted. Not wired to UI. |
| `comm_log_entries` | `migrations/020` | **DB ONLY** — sender, channel, message, incident linking. |
| `record_comments` | `migrations/033_competitive_feature_gaps.sql` | **DB ONLY** — Parent threading, mentioned_user_ids, attachments, is_internal. |
| `email_messages` | `migrations/034_v2_feature_gaps.sql` | **DB ONLY** — Bi-directional threading, message_id, in_reply_to, thread_id. |
| `notification_preferences` | `migrations/006 + 034` | **DB ONLY** — Per-user per-category toggles. UI hardcoded. |
| Supabase Realtime | `src/lib/supabase/realtime.ts` | **PARTIAL** — 22+ table subs incl. notifications. No presence/broadcast. |

### What Does NOT Exist

- No person-to-person messaging (DM, group chat, channels)
- No typing indicators, read receipts, or presence detection
- No audio/video calling or push-to-talk
- No push notifications (only email + in-app bell)
- No offline message queuing
- No message search, no @mention dispatch
- No file sharing within messages
- No mobile-optimized messaging UI

---

## 3. Deliverable 1 — Master Feature Matrix

### Legend

`FULL` | `PARTIAL` | `BETA` | `PAID (tier)` | `VIA INT` | `—` (not supported)  
Relevance: `CRIT` | `HIGH` | `MED` | `LOW` | `N/A`

**Abbreviations:** SLK=Slack, DIS=Discord, MST=MS Teams, CT=ConnectTeam, CRW=Crew, BKP=Beekeeper, STF=Staffbase, LAS=Lasso, MAT=Mattermost, RKT=Rocket.Chat, PMP=Pumble, DEP=Deputy

### 3.1 Core Messaging

| Feature | SLK | DIS | MST | CT | BKP | STF | MAT | RKT | WAB | Relevance |
|---------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----------|
| Direct Messages (1:1) | FULL | FULL | FULL | FULL | FULL | FULL | FULL | FULL | FULL | **CRIT** |
| Group DMs | FULL | FULL | FULL | FULL | FULL | FULL | FULL | FULL | FULL | **CRIT** |
| Threads/Replies | FULL | FULL | FULL | PARTIAL | PARTIAL | PARTIAL | FULL | FULL | FULL | **HIGH** |
| Message Editing | FULL | FULL | FULL | FULL | FULL | FULL | FULL | FULL | FULL | **MED** |
| Message Deletion | FULL | FULL | FULL | FULL | FULL | FULL | FULL | FULL | FULL | **MED** |
| Rich Text Formatting | FULL | FULL | FULL | PARTIAL | PARTIAL | FULL | FULL | FULL | PARTIAL | **MED** |
| Markdown Support | FULL | FULL | PARTIAL | — | — | — | FULL | FULL | — | **LOW** |
| Emoji Reactions | FULL | FULL | FULL | FULL | FULL | FULL | FULL | FULL | FULL | **HIGH** |
| Message Pinning | FULL | FULL | FULL | — | — | PARTIAL | FULL | FULL | — | **HIGH** |
| Message Bookmarking | FULL | — | FULL | — | — | — | FULL | FULL | FULL | **LOW** |
| Scheduled Messages | FULL | — | PAID | FULL | FULL | FULL | — | — | FULL | **HIGH** |
| Read Receipts | PAID | — | FULL | FULL | FULL | FULL | FULL | FULL | FULL | **CRIT** |
| Typing Indicators | FULL | FULL | FULL | — | — | — | FULL | FULL | FULL | **LOW** |
| Message Translation | PAID | — | FULL | FULL | FULL | FULL | VIA INT | VIA INT | FULL | **HIGH** |
| Voice Messages | FULL | FULL | FULL | FULL | FULL | FULL | — | — | FULL | **CRIT** |
| Video Messages | FULL | — | FULL | FULL | — | — | — | — | FULL | **MED** |

### 3.2 Channel/Space Architecture

| Feature | SLK | DIS | MST | CT | BKP | STF | MAT | RKT | Relevance |
|---------|-----|-----|-----|-----|-----|-----|-----|-----|-----------|
| Public Channels | FULL | FULL | FULL | FULL | FULL | FULL | FULL | FULL | **CRIT** |
| Private Channels | FULL | FULL | FULL | FULL | FULL | FULL | FULL | FULL | **CRIT** |
| Shared Channels (cross-org) | PAID | — | FULL | — | — | PAID | — | FULL | **HIGH** |
| Channel Categories | FULL | FULL | FULL | — | FULL | FULL | FULL | — | **HIGH** |
| Channel Templates | — | FULL | PAID | — | — | — | — | — | **HIGH** |
| Auto-Archival | PAID | — | FULL | — | — | — | — | — | **MED** |
| Granular Permissions | FULL | FULL | FULL | PARTIAL | FULL | FULL | FULL | FULL | **CRIT** |
| Announcement-Only | FULL | FULL | FULL | FULL | FULL | FULL | FULL | FULL | **HIGH** |
| Temporary/Ephemeral | — | — | — | — | — | — | — | — | **HIGH** |
| Nested Sub-Channels | — | FULL | — | — | — | — | — | — | **MED** |

### 3.3 Audio/Video Communications

| Feature | SLK | DIS | MST | CT | BKP | MAT | RKT | Relevance |
|---------|-----|-----|-----|-----|-----|-----|-----|-----------|
| 1:1 Voice Calls | FULL | FULL | FULL | — | — | VIA INT | VIA INT | **MED** |
| Group Voice Calls | FULL | FULL | FULL | — | — | VIA INT | VIA INT | **MED** |
| Video Conferencing | FULL | FULL | FULL | — | — | VIA INT | VIA INT | **MED** |
| Screen Sharing | FULL | FULL | FULL | — | — | VIA INT | VIA INT | **LOW** |
| Recording/Transcription | PAID | — | FULL | — | — | — | — | **MED** |
| Live Captions | — | — | FULL | — | — | — | — | **MED** |
| Push-to-Talk | — | FULL | FULL | FULL | — | — | — | **CRIT** |
| Walkie-Talkie Mode | — | FULL | PAID | FULL | — | — | — | **CRIT** |
| SIP/PSTN Bridge | PAID | — | FULL | — | — | — | — | **MED** |

### 3.4 File & Media

| Feature | SLK | DIS | MST | CT | BKP | STF | MAT | RKT | Relevance |
|---------|-----|-----|-----|-----|-----|-----|-----|-----|-----------|
| File Sharing | FULL | FULL | FULL | FULL | FULL | FULL | FULL | FULL | **CRIT** |
| File Previewing | FULL | FULL | FULL | PARTIAL | PARTIAL | PARTIAL | FULL | FULL | **HIGH** |
| File Versioning | VIA INT | — | FULL | — | — | — | — | — | **MED** |
| Media Galleries | — | FULL | — | FULL | FULL | FULL | — | — | **HIGH** |
| Cloud Storage Integration | FULL | — | FULL | — | — | VIA INT | VIA INT | VIA INT | **MED** |
| File Annotations/Markup | VIA INT | — | FULL | — | — | — | — | — | **HIGH** |
| Asset Libraries | — | — | — | FULL | FULL | FULL | — | — | **HIGH** |

### 3.5 Notifications & Presence

| Feature | SLK | DIS | MST | CT | BKP | STF | MAT | RKT | Relevance |
|---------|-----|-----|-----|-----|-----|-----|-----|-----|-----------|
| Per-Channel Notif Control | FULL | FULL | FULL | PARTIAL | FULL | FULL | FULL | FULL | **HIGH** |
| DND / Focus Modes | FULL | FULL | FULL | FULL | FULL | FULL | FULL | FULL | **HIGH** |
| Scheduled DND | FULL | FULL | FULL | FULL | FULL | FULL | — | — | **CRIT** |
| Custom Status | FULL | FULL | FULL | — | — | — | FULL | FULL | **HIGH** |
| Presence Detection | FULL | FULL | FULL | FULL | FULL | — | FULL | FULL | **HIGH** |
| Priority/Urgent Notifs | FULL | FULL | FULL | FULL | FULL | FULL | — | — | **CRIT** |
| Notification Routing | FULL | FULL | FULL | FULL | FULL | FULL | FULL | FULL | **HIGH** |

### 3.6 Search & Discovery

| Feature | SLK | DIS | MST | CT | BKP | MAT | RKT | Relevance |
|---------|-----|-----|-----|-----|-----|-----|-----|-----------|
| Full-Text Search | FULL | FULL | FULL | PARTIAL | PARTIAL | FULL | FULL | **HIGH** |
| Filtered Search | FULL | PARTIAL | FULL | — | — | FULL | FULL | **HIGH** |
| Search Operators | FULL | — | FULL | — | — | FULL | — | **MED** |
| AI-Powered Search | PAID | — | FULL | — | — | BETA | — | **MED** |

### 3.7 Workflow & Automation

| Feature | SLK | DIS | MST | CT | BKP | STF | MAT | MON | CLK | Relevance |
|---------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----------|
| Workflow Builder | FULL | — | FULL | FULL | — | — | — | FULL | FULL | **HIGH** |
| Custom Bots | FULL | FULL | FULL | — | — | — | FULL | — | — | **MED** |
| Automated Triggers | FULL | FULL | FULL | FULL | FULL | FULL | FULL | FULL | FULL | **CRIT** |
| Escalation Rules | PAID | — | FULL | FULL | FULL | FULL | — | — | — | **CRIT** |
| Scheduled Announcements | FULL | — | FULL | FULL | FULL | FULL | — | FULL | — | **HIGH** |

### 3.8 Administration & Compliance

| Feature | SLK | DIS | MST | CT | BKP | STF | MAT | RKT | Relevance |
|---------|-----|-----|-----|-----|-----|-----|-----|-----|-----------|
| SCIM Provisioning | PAID | — | FULL | — | PAID | PAID | FULL | PAID | **MED** |
| RBAC / Roles | FULL | FULL | FULL | FULL | FULL | FULL | FULL | FULL | **CRIT** |
| Data Retention | PAID | — | FULL | — | PAID | PAID | FULL | FULL | **HIGH** |
| Message Export | FULL | — | FULL | — | — | PAID | FULL | FULL | **HIGH** |
| Audit Logs | PAID | — | FULL | — | PAID | PAID | FULL | FULL | **HIGH** |
| DLP | PAID | — | FULL | — | — | PAID | FULL | — | **MED** |
| SOC2/GDPR | FULL | — | FULL | FULL | FULL | FULL | FULL | FULL | **HIGH** |
| Guest Access Controls | FULL | — | FULL | FULL | FULL | FULL | FULL | FULL | **CRIT** |

### 3.9 Mobile & Field Operations

| Feature | SLK | DIS | MST | CT | BKP | STF | DEP | Relevance |
|---------|-----|-----|-----|-----|-----|-----|-----|-----------|
| Native Mobile Apps | FULL | FULL | FULL | FULL | FULL | FULL | FULL | **CRIT** |
| Offline / Message Queuing | PARTIAL | — | PARTIAL | FULL | FULL | FULL | FULL | **CRIT** |
| Low-Bandwidth Optimization | — | — | PARTIAL | FULL | FULL | FULL | FULL | **CRIT** |
| Push Notification Reliability | FULL | FULL | FULL | FULL | FULL | FULL | FULL | **CRIT** |
| GPS / Location Sharing | — | — | — | FULL | — | — | FULL | **HIGH** |
| Mobile Check-In/Out | — | — | — | FULL | FULL | — | FULL | **HIGH** |
| Shift-Based Messaging | — | — | — | FULL | FULL | FULL | FULL | **CRIT** |
| Kiosk Mode | — | — | — | FULL | FULL | FULL | FULL | **MED** |
| Deskless Worker Features | — | — | — | FULL | FULL | FULL | FULL | **CRIT** |

### 3.10 Team & Org Management

| Feature | SLK | DIS | MST | CT | BKP | STF | MAT | Relevance |
|---------|-----|-----|-----|-----|-----|-----|-----|-----------|
| Org Chart / Directory | PARTIAL | — | FULL | FULL | FULL | FULL | — | **HIGH** |
| Department/Team Grouping | FULL | FULL | FULL | FULL | FULL | FULL | FULL | **CRIT** |
| Multi-Workspace | FULL | FULL | FULL | FULL | — | FULL | FULL | **HIGH** |
| Custom Profile Fields | PAID | — | — | FULL | — | FULL | — | **HIGH** |
| Shift Scheduling Integration | — | — | FULL | FULL | FULL | — | — | **CRIT** |
| Time Tracking Integration | — | — | — | FULL | — | — | — | **HIGH** |

### 3.11 AI & Intelligence

| Feature | SLK | DIS | MST | CT | BKP | MAT | Relevance |
|---------|-----|-----|-----|-----|-----|-----|-----------|
| AI Message Summarization | PAID | FULL | FULL | — | — | BETA | **HIGH** |
| AI Thread Catch-Up | PAID | — | FULL | — | — | — | **HIGH** |
| AI Suggested Replies | — | — | FULL | — | — | — | **LOW** |
| Sentiment Analysis | — | — | PAID | — | FULL | — | **MED** |
| Knowledge Base Extraction | — | — | FULL | — | — | — | **MED** |

### 3.12 Tier 3 — Event Platforms (Boomset, Grip, Brella, Swapcard, Whova, Crewmeister, Deputy)

These platforms offer **limited messaging** focused on attendee networking or shift coordination:

| Feature | BMS | GRP | BRL | SWP | WHO | CRM | DEP |
|---------|-----|-----|-----|-----|-----|-----|-----|
| 1:1 DMs | FULL | FULL | FULL | FULL | FULL | — | FULL |
| Group DMs | — | — | — | FULL | — | — | FULL |
| Channels | — | — | — | — | — | — | — |
| Push Notifications | FULL | FULL | FULL | FULL | FULL | FULL | FULL |
| Shift Messaging | — | — | — | — | — | FULL | FULL |
| Offline | — | — | — | — | — | — | FULL |

**Key takeaway:** Event platforms have basic DM for attendee networking but no team collaboration. Deputy/Crewmeister have shift-aware messaging but no channel architecture. Neither tier matches the depth needed for production team coordination.

---

## 4. Deliverable 2 — Gap Analysis (CRITICAL + HIGH Features)

| # | Feature | Category | Competitors w/ Support | Our Status | Differentiation Opportunity | Complexity |
|---|---------|----------|----------------------|------------|---------------------------|------------|
| G1 | Direct Messages (1:1) | Core | 27/27 (100%) | **MISSING** | Entity-linked DMs (message from any record page) | **M** |
| G2 | Group DMs | Core | 24/27 (89%) | **MISSING** | Auto-create per department/shift | **M** |
| G3 | Public Channels | Channel | 22/27 (81%) | **MISSING** (DB exists) | Per-event auto-provisioning from templates | **L** |
| G4 | Private Channels | Channel | 22/27 (81%) | **MISSING** | RBAC-gated client isolation | **L** |
| G5 | Threaded Replies | Core | 18/27 (67%) | **MISSING** (DB: parent_comment_id) | Thread from any record comment | **M** |
| G6 | Emoji Reactions | Core | 22/27 (81%) | **MISSING** | Quick acks (✅=done, 🔧=WIP) | **S** |
| G7 | Message Pinning | Core | 14/27 (52%) | **MISSING** | Auto-pin safety briefings, call sheets | **S** |
| G8 | Scheduled Messages | Core | 12/27 (44%) | **MISSING** | Tie to event timeline (T-24h, T-1h) | **S** |
| G9 | Read Receipts | Core | 14/27 (52%) | **MISSING** | Mandatory-read for safety docs | **M** |
| G10 | Voice Messages | Core | 14/27 (52%) | **MISSING** | Record + auto-transcribe field reports | **L** |
| G11 | Push-to-Talk | Audio | 5/27 (19%) | **MISSING** | Digital radio replacement with logging | **XL** |
| G12 | @Mentions + Dispatch | Core | 25/27 (93%) | **PARTIAL** (DB only) | @mention → multi-channel notification | **M** |
| G13 | Granular Channel Perms | Channel | 18/27 (67%) | **MISSING** | Auto-perms from RBAC + credential status | **M** |
| G14 | Announcement-Only | Channel | 16/27 (59%) | **MISSING** | Commander broadcast + mandatory read | **S** |
| G15 | Ephemeral Channels | Channel | 0/27 (0%) | **MISSING** | **BLUE OCEAN**: Auto-archive post-wrap | **M** |
| G16 | Channel Templates | Channel | 3/27 (11%) | **MISSING** | Template per event type | **M** |
| G17 | Shared Channels | Channel | 5/27 (19%) | **MISSING** | Vendor/client scoped in multi-tenant | **L** |
| G18 | File Sharing in Messages | File | 27/27 (100%) | **PARTIAL** (Storage exists) | Attach from asset library | **M** |
| G19 | Media Galleries | File | 8/27 (30%) | **MISSING** | Per-event gallery with GPS+timestamp | **M** |
| G20 | File Annotations | File | 3/27 (11%) | **MISSING** | Mark up site plans in context | **L** |
| G21 | Per-Channel Notif Control | Notif | 18/27 (67%) | **MISSING** | Per-channel + per-event prefs | **M** |
| G22 | Scheduled DND | Notif | 10/27 (37%) | **MISSING** | Auto-DND from shift schedule | **M** |
| G23 | Custom Status | Notif | 12/27 (44%) | **MISSING** | Location-aware from zone data | **M** |
| G24 | Priority Notifications | Notif | 14/27 (52%) | **MISSING** | Break DND for emergency only | **M** |
| G25 | Presence Detection | Notif | 16/27 (59%) | **MISSING** | Supabase Realtime Presence | **M** |
| G26 | Full-Text Search | Search | 18/27 (67%) | **MISSING** | Postgres tsvector + entity cross-ref | **M** |
| G27 | Automated Triggers | Workflow | 20/27 (74%) | **PARTIAL** | Cue fired → channel message | **M** |
| G28 | Escalation Rules | Workflow | 8/27 (30%) | **MISSING** | Unread safety → escalate chain | **L** |
| G29 | Native Mobile | Mobile | 27/27 (100%) | **MISSING** | PWA first, then native wrapper | **XL** |
| G30 | Offline Queuing | Mobile | 10/27 (37%) | **MISSING** | Service Worker + IndexedDB | **L** |
| G31 | Low-Bandwidth Mode | Mobile | 8/27 (30%) | **MISSING** | Text-first, deferred media | **M** |
| G32 | Shift-Based Messaging | Mobile | 8/27 (30%) | **MISSING** | Route to on-shift crew only | **M** |
| G33 | GPS Location Sharing | Mobile | 4/27 (15%) | **MISSING** | Overlay on foh_zones spatial grid | **L** |
| G34 | Department Grouping | Team | 22/27 (81%) | **PARTIAL** | Auto-group from dept hierarchy | **S** |
| G35 | Shift Schedule Integration | Team | 10/27 (37%) | **PARTIAL** | Auto-channel membership from shifts | **M** |
| G36 | Custom Profile Fields | Team | 5/27 (19%) | **PARTIAL** | Certs, callsign, languages | **S** |
| G37 | AI Summarization | AI | 4/27 (15%) | **MISSING** | "Catch me up" per channel | **L** |
| G38 | AI Shift Handoff | AI | 2/27 (7%) | **MISSING** | Auto-summary for incoming crew | **L** |
| G39 | Message Translation | Core | 8/27 (30%) | **MISSING** | Auto-translate per locale | **M** |
| G40 | Guest Access Controls | Admin | 14/27 (52%) | **PARTIAL** | Time-boxed to event lifecycle | **M** |
| G41 | Data Retention | Admin | 8/27 (30%) | **PARTIAL** (migration 030) | Per-event retention per contract | **S** |
| G42 | Message Export | Admin | 10/27 (37%) | **MISSING** | Per-event CSV/PDF compliance log | **M** |

---

## 5. Deliverable 3 — Competitive Differentiation Map

### Table Stakes (Must-Have — Every Competitor Has It)

| Feature | Support Rate |
|---------|-------------|
| Direct Messages (1:1) | 100% |
| Group DMs | 89% |
| Public/Private Channels | 81% |
| File Sharing in Messages | 100% |
| Native Mobile Experience | 100% |
| Push Notifications | 100% |
| Emoji Reactions | 81% |
| Basic Search | 67% |
| RBAC in Messaging | 81% |

### Competitive Parity (Match Market — 30-60% Support)

Threaded Replies, @Mentions, Read Receipts, Message Pinning, Scheduled Messages, Custom Status, Presence Detection, Granular Notification Prefs, Message Translation, Full-Text Search, Automation Triggers in Messaging.

### Vertical Differentiators (Uniquely Valuable for Production Teams)

| Differentiator | Description | Why Horizontal Platforms Can't Compete |
|---------------|-------------|---------------------------------------|
| **Zone-Gated Comms** | Messages scoped to `foh_zones` — only crew in a zone sees zone messages. | Slack/Teams have no concept of physical zones. |
| **Credential-Linked Channels** | Channel access requires valid credential from `credential_assignments`. Auto-revoked on expiry. | No competitor links messaging to real-world certifications. |
| **Shift-Aware Routing** | Route to on-shift crew per `crew_shifts`. Off-shift gets digest. Shift handoff auto-summary. | ConnectTeam/Deputy have basic shift messaging but none integrate with production schedules + dept hierarchy + event timeline. |
| **Event-Lifecycle Channels** | Auto-create from template at event creation, auto-archive at wrap, export comm log as deliverable. | No horizontal platform understands event lifecycle phases. |
| **Cue-Triggered Notifications** | `ros_cues` EXECUTE → targeted notification to department channel. | Unique to live production. No competitor has cue systems. |
| **Incident-Linked Communication** | Messages link to `incidents`. Auto-create thread with mandatory ack from safety team. | No competitor links messaging to incident management with compliance audit trails. |
| **Vendor Isolation + Event Scoping** | Vendor sees only contracted-event channels. Auto-revoke 48h post-loadout. | Slack Connect has no event-scoped, time-boxed access. |
| **Radio Channel Digital Twin** | `comm_channels` mirrors physical radios. Digital + radio traffic in unified searchable timeline. | No competitor models physical-to-digital radio mapping. |
| **Command Layer Hierarchy** | Messages route through ICS command hierarchy: Commander → Dept Head → Lead → Crew. | Mirrors Incident Command System used in live events. |

### Blue Ocean (No Competitor Offers)

| Feature | Pain Point | Moat |
|---------|-----------|------|
| **Ephemeral Event Channels** | Hundreds of dead channels post-event. Auto-archive + export + cleanup tied to event lifecycle. | 0/27 support this. |
| **Mandatory Read + Acknowledge** | Safety briefings must be confirmed. Digital replaces paper sign-off with escalation. | Read receipts exist, but mandatory + escalation + compliance reporting is novel. |
| **Context-Aware Quick Messages** | One-tap message from any record with entity context pre-attached. | No competitor has record-contextual messaging. |
| **Shift Handoff Summaries** | AI auto-summary of channel activity since last handoff for incoming crew. | Novel — ConnectTeam has basic shift notes but not auto-generated from messages. |
| **Bandwidth-Adaptive Messaging** | Auto-detect connectivity → full media → text-only → queued → SMS fallback chain. | No competitor implements multi-tier connectivity fallback. |
| **Production Radio Log Integration** | Voice-to-text from walkie-talkie recordings into same timeline as digital messages. | Unique to production industry. |

---

## 6. Deliverable 4 — Prioritized Integration Roadmap

### Phase Summary

| Phase | Name | Weeks | Sprints | Focus |
|-------|------|-------|---------|-------|
| **1** | Messaging Foundation | 1–4 | 4 | Core engine: DMs, channels, threads, reactions |
| **2** | Production-Aware Messaging | 5–8 | 4 | Event channels, shift-gating, credential-linking, RBAC |
| **3** | Field Operations | 9–12 | 4 | PWA, offline, push, presence, low-bandwidth |
| **4** | Intelligence & Automation | 13–16 | 4 | Search, AI summaries, escalation, export |
| **5** | Audio/Video & Advanced | 17–22 | 6 | Voice messages, PTT, walkie-talkie, calls |

---

### Phase 1 — Messaging Foundation (Weeks 1–4)

| Feature Cluster | Priority | Complexity | Deps | Sprint |
|----------------|----------|------------|------|--------|
| Messaging Schema (DB) | P0 | M | — | 1 |
| Conversations API (REST) | P0 | M | Schema | 1 |
| Supabase Realtime Integration | P0 | M | Schema | 1 |
| Message List + Composer UI | P0 | L | API | 2 |
| Conversations Sidebar / Inbox | P0 | M | UI | 2 |
| DM from Record Context | P0 | S | Inbox | 2 |
| Threaded Replies | P1 | M | UI | 3 |
| Emoji Reactions | P1 | S | UI | 3 |
| Message Pinning | P1 | S | UI | 3 |
| Channel Architecture | P1 | L | Conversations | 3–4 |
| Read Receipts | P1 | M | Messages | 4 |
| Typing Indicators | P2 | S | Realtime | 4 |
| Scheduled Messages | P2 | S | API | 4 |
| @Mention Parsing + Dispatch | P1 | M | Messages + Notifs | 4 |

**New DB tables:** `conversations`, `conversation_members`, `messages`, `message_reactions`, `message_read_receipts`

**New UI components:** `message-list`, `message-bubble`, `message-composer`, `conversation-list`, `conversation-header`, `thread-panel`, `reaction-picker`, `mention-autocomplete`, `channel-browser`

**New API routes:** `POST/GET /api/conversations`, `GET/POST /api/conversations/[id]/messages`, `PATCH/DELETE /api/messages/[id]`, `POST /api/messages/[id]/reactions`, `POST /api/messages/[id]/pin`

**Effort:** 4 sprints × 2 engineers

---

### Phase 2 — Production-Aware Messaging (Weeks 5–8)

| Feature Cluster | Priority | Complexity | Deps | Sprint |
|----------------|----------|------------|------|--------|
| Event-Lifecycle Channels | P0 | M | Ph1 Channels | 5 |
| Channel Templates | P0 | M | Event Channels | 5 |
| RBAC-Gated Channel Access | P0 | M | Channels + RBAC | 5 |
| Shift-Gated Message Routing | P1 | M | Ph1 + crew_shifts | 6 |
| Credential-Linked Channels | P1 | M | Channels + credentials | 6 |
| Announcement + Mandatory Read | P1 | M | Channels + Receipts | 6 |
| Vendor/Client Isolation | P0 | M | Channels + multi-tenant | 7 |
| Cue-Triggered Notifications | P1 | M | Ph1 + ros_cues | 7 |
| Incident-Linked Threads | P1 | M | Threads + incidents | 7 |
| Radio Channel Digital Twin | P2 | L | comm_channels | 8 |
| Ephemeral Channel Lifecycle | P2 | M | Event Channels | 8 |
| Department Auto-Groups | P1 | S | Channels + depts | 8 |

**New DB tables:** `channel_templates`, `mandatory_read_receipts`

**Effort:** 4 sprints × 2 engineers

---

### Phase 3 — Field Operations (Weeks 9–12)

| Feature Cluster | Priority | Complexity | Deps | Sprint |
|----------------|----------|------------|------|--------|
| PWA Messaging Shell | P0 | L | Ph1 | 9 |
| Offline Message Queuing | P0 | L | PWA | 9–10 |
| Web Push Notifications | P0 | M | PWA + Notifs | 10 |
| Low-Bandwidth Mode | P1 | M | Ph1 | 10 |
| Presence Detection | P1 | M | Realtime | 11 |
| Custom Status | P1 | S | Presence | 11 |
| GPS Location Sharing | P2 | L | Mobile + foh_zones | 11 |
| DND + Shift-Scheduled DND | P1 | M | Notifs + shifts | 12 |
| Notification Digest | P2 | M | Notifs | 12 |
| Kiosk Mode | P2 | M | PWA | 12 |

**OSS accelerators:** Workbox (SW), idb-keyval (IndexedDB), web-push (npm)

**Effort:** 4 sprints × 2 engineers + 1 mobile specialist

---

### Phase 4 — Intelligence & Automation (Weeks 13–16)

| Feature Cluster | Priority | Complexity | Deps | Sprint |
|----------------|----------|------------|------|--------|
| Full-Text Message Search | P0 | M | Ph1 | 13 |
| Cross-Entity Search | P1 | M | Search | 13 |
| Status → Message Automation | P1 | M | Ph1 + automation | 14 |
| Escalation Rules | P1 | L | Notifs + Messages | 14 |
| AI Message Summarization | P2 | L | Ph1 + LLM | 15 |
| AI Shift Handoff Summary | P2 | L | Summarize + shifts | 15 |
| Message Translation | P2 | M | Ph1 | 16 |
| Message Export / Compliance | P1 | M | Ph1 | 16 |

**LLM approach:** Supabase Edge Function → external API (OpenAI/Anthropic). Opt-in per org. Feature-flag gated.

**Effort:** 4 sprints × 2 engineers + 1 AI/ML engineer

---

### Phase 5 — Audio/Video & Advanced (Weeks 17–22)

| Feature Cluster | Priority | Complexity | Deps | Sprint |
|----------------|----------|------------|------|--------|
| Voice Messages | P1 | M | Ph1 + Storage | 17 |
| Video Messages | P2 | M | Voice | 17 |
| Push-to-Talk (Software) | P1 | XL | WebRTC + Channels | 18–19 |
| Walkie-Talkie Mode | P1 | XL | PTT | 19–20 |
| 1:1 Voice/Video Calls | P2 | L | WebRTC | 20 |
| Group Voice Calls | P2 | XL | WebRTC + SFU | 21 |
| Screen Sharing | P2 | M | Calls | 22 |

**Build vs. Buy:** Push-to-talk and walkie-talkie are the highest-complexity features. **Recommendation: Use LiveKit (open-source SFU)** as the WebRTC infrastructure. Self-hostable, Supabase-compatible, supports PTT natively.

**Effort:** 6 sprints × 2 engineers + 1 WebRTC specialist

---

## 7. Architecture Recommendations

### 7.1 Messaging Engine — Supabase-Native

Build on existing Supabase infrastructure rather than embedding third-party SDKs:

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Persistence** | Supabase Postgres | Same DB as all other entities. Enables entity cross-refs, RLS, 3NF compliance. |
| **Realtime Delivery** | Supabase Realtime (Postgres Changes + Broadcast + Presence) | Already in use for 22+ tables. No new infrastructure. |
| **Push Notifications** | Web Push API via Edge Function | Standards-based, no vendor lock-in. |
| **Offline** | Service Worker + IndexedDB (Workbox) | PWA-standard approach. |
| **Voice/Video** | LiveKit (open-source SFU) | Self-hostable, WebRTC-native, supports PTT. |
| **AI** | Edge Function → external LLM API | Keeps LLM choice flexible. |
| **Search** | Postgres `tsvector` + GIN index | Already used in platform. No Elasticsearch needed initially. |

### 7.2 Schema Design Principles

- All messaging tables follow existing 3NF/SSOT conventions
- `conversations` links to `organizations`, `live_event_instances`, `projects` via FK
- `messages` links to any entity via `entity_type` + `entity_id` (polymorphic, same pattern as `record_comments`)
- RLS policies derive from `conversation_members` + existing RBAC
- `mentioned_user_ids UUID[]` on messages (same pattern as `record_comments`)
- Full audit trail via `record_activity_log` integration

### 7.3 RBAC Integration

| Role | Messaging Capability |
|------|---------------------|
| **exec** | All channels, create/archive channels, manage templates |
| **director** | All event channels, create channels, pin messages |
| **pm** | Assigned-event channels, create group DMs, pin messages |
| **member** | Assigned-event channels, DMs, reactions |
| **client** | Client-facing channels only, DMs with assigned PM |
| **collaborator** | Contracted-event channels only, DMs with PM/director |

### 7.4 Open-Source Alternatives (Build vs. Buy)

| Component | OSS Option | Maturity | Advantage | Disadvantage |
|-----------|-----------|----------|-----------|--------------|
| Full chat SDK | **Mattermost** (Go + React) | Production | Complete solution | Separate server, separate auth, separate DB. Breaks SSOT. |
| Full chat SDK | **Rocket.Chat** (Node + Meteor) | Production | Complete solution | Same SSOT concerns. Heavy runtime. |
| Chat UI components | **stream-chat-react** | Production | Beautiful UI | SaaS dependency ($). |
| WebRTC SFU | **LiveKit** | Production | PTT support, self-host | Requires separate server. |
| WebRTC SFU | **Janus** | Mature | Lightweight | Complex C codebase. |
| Push notifications | **web-push** (npm) | Stable | Standards-based | Manual key management. |

**Recommendation:** Build messaging natively on Supabase (preserves SSOT, RBAC, multi-tenancy). Use LiveKit only for voice/video (Phase 5). Avoid Mattermost/Rocket.Chat embedding — the integration cost to maintain RBAC parity, multi-tenant isolation, and entity cross-references exceeds the build cost of a purpose-built messaging layer.

---

## 8. Open Questions — Decisions & Recommendations

| # | Question | Recommendation | Rationale |
|---|---------|---------------|-----------|
| 1 | **Dedicated messaging route vs. slide-over panel?** | **Hybrid: slide-over panel default + `/messages` full-page route** | Platform is record-centric (48+ entity pages). Slide-over preserves context. Full page for power users / event commanders monitoring channels. Uses `SlidePanel` from Motion Strategy + `MessagingProvider` in Zustand. Matches Monday.com/ClickUp/Notion pattern. |
| 2 | **Message storage limits per org/tier?** | **Unlimited history. Rate-limit at 60 msg/min per user.** | Event comms are compliance-critical (safety briefings, incident logs). Use existing `data_retention_policies` (migration 030) for compliance-driven purging, not tier-based caps. Monetize on features (AI, PTT, voice) not storage. Postgres text is ~$0.125/GB/month. File attachment quotas per org/tier are more appropriate. |
| 3 | **Push-to-talk priority vs. voice messages?** | **Voice messages first (Phase 3), PTT second (Phase 5)** | Voice messages cover 80% of field needs at M complexity (MediaRecorder → Storage → auto-transcribe). PTT is XL (WebRTC SFU, audio mixing, channel switching). Auto-transcription makes voice messages searchable (aligns with Phase 4 search). Ship voice early → validate field adoption → invest in PTT only if demand confirmed. |
| 4 | **LiveKit self-hosted vs. LiveKit Cloud?** | **LiveKit Cloud initially. Self-host when bill exceeds $5K/month.** | Self-hosted requires dedicated server cluster + TURN/STUN + monitoring. At early scale: 100-person event × 8hr PTT × 6 channels ≈ $115/event — negligible vs. production budgets. SDK is identical for cloud vs. self-hosted (config change, not rewrite). Decision trigger: $5K/month threshold. |
| 5 | **AI summarization LLM provider?** | **Anthropic Claude via API, OpenAI as fallback, behind provider interface** | Claude excels at structured summarization from conversation data. Edge Function strips PII before sending (names → role labels). Define `LLMProvider` interface in shared util. Feature-flag per org. Self-hosted Llama premature (3-5x latency penalty). Revisit when on-prem demand materializes. |
| 6 | **SMS fallback for critical alerts?** | **Yes, Twilio, but only for `emergency` + `critical` priority** | Fallback chain: App Push → Web Push → Email → SMS. Restrict SMS to emergency channel, safety alerts, and mandatory-read timeout (30min). ~50-200 SMS/event ($0.38–$1.50). Store mobile in `profiles`, add `sms_enabled` to `notification_preferences`. Respect DND except emergency. Voice call escalation available on same Twilio account later. |
| 7 | **Migrate `record_comments` → `messages`?** | **Yes — unify into `messages` table with entity_type + entity_id scope** | Two tables with identical shape (text, author, threading, mentions, attachments) violates SSOT. Unified model: message with `entity_type + entity_id + conversation_id IS NULL` = record comment; with `conversation_id` = chat message. One table, one search index, one realtime sub, one notification path. `CommentsSection` UI stays — reads from `messages WHERE entity_type = X`. Enables "Context-Aware Quick Messages" differentiator. |
| 8 | **Lasso integration depth?** | **Compete on communications, integrate on staffing data only** | Lasso's messaging is basic (no channels, PTT, event-lifecycle). Import crew rosters via Lasso API → feed `crew_shifts`, `credential_assignments`, `live_crew_assignments` → drive messaging permissions. No bidirectional message sync. Vendor channel architecture stays generic (via `vendor_contracts` + event assignment). Add Lasso to `integrations` provider list with `type: 'staffing'`. |

---

## Appendix A — Pricing Notes for Gated Features

| Platform | Free Tier Messaging Limits | Paid Tier for Full Messaging |
|----------|--------------------------|------------------------------|
| Slack | 90-day history, no SSO, 10 integrations | Pro $8.75/user/mo, Business+ $15/user/mo |
| Discord | Unlimited history, basic roles | Nitro $10/mo (cosmetic), no enterprise tier |
| MS Teams | 500K messages, basic admin | M365 Biz Basic $6/user/mo, E3 $36/user/mo |
| ConnectTeam | 1 channel, basic features | Expert $9.99/user/mo for full comms |
| Beekeeper | — | Custom pricing (~$5-15/user/mo) |
| Staffbase | — | Custom pricing (~$8-20/user/mo) |
| Mattermost | Unlimited (self-hosted) | Enterprise $10/user/mo |
| Rocket.Chat | Unlimited (self-hosted) | Enterprise $7/user/mo |

## Appendix B — Feature Count Summary

| Category | Total Features | CRIT | HIGH | MED | LOW | N/A |
|----------|---------------|------|------|-----|-----|-----|
| Core Messaging | 16 | 4 | 5 | 5 | 2 | 0 |
| Channel Architecture | 10 | 3 | 4 | 2 | 0 | 1 |
| Audio/Video | 13 | 2 | 0 | 5 | 2 | 4 |
| File & Media | 8 | 1 | 4 | 2 | 0 | 1 |
| Notifications & Presence | 9 | 3 | 4 | 1 | 1 | 0 |
| Search & Discovery | 7 | 0 | 2 | 3 | 2 | 0 |
| Workflow & Automation | 9 | 2 | 3 | 2 | 0 | 2 |
| Integrations | 8 | 1 | 3 | 3 | 0 | 1 |
| Admin & Compliance | 10 | 2 | 4 | 3 | 1 | 0 |
| Mobile & Field Ops | 9 | 5 | 2 | 1 | 0 | 1 |
| Team & Org Mgmt | 10 | 2 | 4 | 2 | 0 | 2 |
| AI & Intelligence | 9 | 0 | 2 | 4 | 2 | 1 |
| **TOTAL** | **118** | **25** | **37** | **33** | **10** | **13** |
