# 🧭 WAYFINDER — Interaction Cost Map

**Prompt Code:** `FP-UX-WAYFINDER-001` · **Phase 3.3** · **Date:** 2026-03-21

---

## Cost Formula

```
Total Cost = (Clicks × 1) + (Page Loads × 2) + (Cognitive Decisions × 3) + (Context Switches × 4)

SCORING:
├── Cost 1-3:   🟢 EFFORTLESS
├── Cost 4-6:   🟡 MANAGEABLE
├── Cost 7-10:  🔴 BURDENSOME
└── Cost 11+:   ⚫ HOSTILE
```

---

## Core Task Interaction Costs

### Entity Management

| Task | Clicks | Page Loads | Decisions | Switches | **Cost** | Score |
|------|:------:|:----------:|:---------:|:--------:|:--------:|:-----:|
| **Create event** (via Quick Create) | 2 | 1 | 1 | 0 | 2+2+3+0 = **7** | 🔴 |
| **Create event** (via ⌘K) | 1 | 1 | 0 | 0 | 1+2+0+0 = **3** | 🟢 |
| **View event list** | 2 | 1 | 1 | 0 | 2+2+3+0 = **7** | 🔴 |
| **View event list** (via sidebar) | 1 | 1 | 1 | 0 | 1+2+3+0 = **6** | 🟡 |
| **Find specific event** (⌘K) | 2 | 1 | 0 | 0 | 2+2+0+0 = **4** | 🟡 |
| **View event detail** | 2 | 2 | 2 | 0 | 2+4+6+0 = **12** | ⚫ |
| **OPTIMIZED: View event** (⌘K → Enter) | 1 | 1 | 0 | 0 | 1+2+0+0 = **3** | 🟢 |

### Crew Management

| Task | Clicks | Page Loads | Decisions | Switches | **Cost** | Score |
|------|:------:|:----------:|:---------:|:--------:|:--------:|:-----:|
| **Assign crew to event** (current) | 5 | 2 | 3 | 1 | 5+4+9+4 = **22** | ⚫ |
| **OPTIMIZED: Assign crew** (inline popover) | 2 | 0 | 0 | 0 | 2+0+0+0 = **2** | 🟢 |
| **View my schedule** (member) | 1 | 1 | 1 | 0 | 1+2+3+0 = **6** | 🟡 |
| **View crew availability** | 2 | 1 | 1 | 0 | 2+2+3+0 = **7** | 🔴 |
| **OPTIMIZED: Availability** (pinned) | 1 | 1 | 0 | 0 | 1+2+0+0 = **3** | 🟢 |

### Production Operations

| Task | Clicks | Page Loads | Decisions | Switches | **Cost** | Score |
|------|:------:|:----------:|:---------:|:--------:|:--------:|:-----:|
| **Create task** (Quick Create) | 2 | 1 | 1 | 0 | 2+2+3+0 = **7** | 🔴 |
| **Create task** (⌘K) | 1 | 1 | 0 | 0 | 1+2+0+0 = **3** | 🟢 |
| **View my tasks** | 1 | 1 | 0 | 0 | 1+2+0+0 = **3** | 🟢 |
| **Update task status** (inline) | 2 | 0 | 1 | 0 | 2+0+3+0 = **5** | 🟡 |
| **View calendar** | 1 | 1 | 0 | 0 | 1+2+0+0 = **3** | 🟢 |

### Financial Operations

| Task | Clicks | Page Loads | Decisions | Switches | **Cost** | Score |
|------|:------:|:----------:|:---------:|:--------:|:--------:|:-----:|
| **Create invoice** (Quick Create) | 2 | 1 | 1 | 0 | 2+2+3+0 = **7** | 🔴 |
| **View event budget** | 2 | 1 | 1 | 0 | 2+2+3+0 = **7** | 🔴 |
| **OPTIMIZED: View budget** (from event) | 1 | 0 | 0 | 0 | 1+0+0+0 = **1** | 🟢 |
| **Track expenses** | 2 | 1 | 1 | 0 | 2+2+3+0 = **7** | 🔴 |
| **View financial reports** | 2 | 1 | 2 | 0 | 2+2+6+0 = **10** | 🔴 |
| **Manage vendor payments** | 3 | 1 | 2 | 0 | 3+2+6+0 = **11** | ⚫ |
| **OPTIMIZED: Payments** (pinned) | 1 | 1 | 0 | 0 | 1+2+0+0 = **3** | 🟢 |

### Settings & Account

| Task | Clicks | Page Loads | Decisions | Switches | **Cost** | Score |
|------|:------:|:----------:|:---------:|:--------:|:--------:|:-----:|
| **Update profile** | 2 | 1 | 1 | 0 | 2+2+3+0 = **7** | 🔴 |
| **Access settings** | 2 | 1 | 1 | 0 | 2+2+3+0 = **7** | 🔴 |
| **Configure notifications** | 3 | 1 | 2 | 0 | 3+2+6+0 = **11** | ⚫ |
| **OPTIMIZED: Notifications** (Settings URL tab) | 1 | 1 | 0 | 0 | 1+2+0+0 = **3** | 🟢 |
| **Get help** | 2 | 0 | 1 | 0 | 2+0+3+0 = **5** | 🟡 |

---

## Cost Distribution Summary

### Before Optimization

| Score | Count | Tasks |
|:-----:|:-----:|-------|
| 🟢 EFFORTLESS (1-3) | 5 | My tasks, Calendar, Budget tab, ⌘K nav, Create via ⌘K |
| 🟡 MANAGEABLE (4-6) | 4 | Find event, My schedule, Update status, Get help |
| 🔴 BURDENSOME (7-10) | 9 | Most sidebar nav tasks, create via Quick Create, track expenses |
| ⚫ HOSTILE (11+) | 4 | Assign crew, Vendor payments, Configure notifications, View event detail (from scratch) |

### After Optimization

| Optimization | Cost Reduction | Mechanism |
|-------------|:-:|------------|
| **⌘K command palette** for all navigation | 12→3 | Keyboard-only, zero decisions |
| **Pinned favorites** for frequent items | 7→3 | Eliminates section expansion + cognitive decisions |
| **Inline popover** for crew assignment | 22→2 | Eliminates page loads + context switches |
| **URL-based tabs** for entity facets | 7→3 | Direct link to `/events/[id]/crew` |
| **Settings URL tabs** | 11→3 | Direct link to `/settings/notifications` |

---

## Optimization Priority Matrix

| # | Task | Current Cost | Optimized Cost | Effort | Priority |
|---|------|:--------:|:--------:|:------:|:--------:|
| 1 | Assign crew to event | ⚫ 22 | 🟢 2 | Medium | **P0** |
| 2 | Configure notifications | ⚫ 11 | 🟢 3 | Low | **P1** |
| 3 | Manage vendor payments | ⚫ 11 | 🟢 3 | Low | **P1** |
| 4 | View event detail | ⚫ 12 | 🟢 3 | Low | **P1** |
| 5 | Financial reports | 🔴 10 | 🟢 3 | Low | **P2** |
| 6 | Track expenses | 🔴 7 | 🟡 5 | Low | **P2** |
| 7 | Create event (Quick Create) | 🔴 7 | 🟢 3 | Already optimized via ⌘K | **P3** |
