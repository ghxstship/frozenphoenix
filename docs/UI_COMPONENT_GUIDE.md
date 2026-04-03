# UI Component Guide — FrozenPhoenix

> **Design System:** Contemporary Minimal Pop Art — Monochromatic with semantic accent colors
> **Stack:** Next.js App Router · Tailwind v4 · Radix UI Primitives · lucide-react icons

---

## Quick Start

All UI components are importable from the barrel file or individual paths:

```tsx
// Barrel import (recommended for atoms/molecules)
import { Button, Input, Badge, Card } from "@/components/ui";

// Direct import (for complex components)
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CommandPalette } from "@/components/ui/command-palette";
```

---

## Button

The primary interactive element. Supports 7 variants, 5 sizes, and `asChild` composition.

```tsx
import { Button } from "@/components/ui/button";

// Standard usage
<Button variant="default" size="sm" onClick={handleSave}>Save Changes</Button>

// Destructive action
<Button variant="destructive">Delete Project</Button>

// Ghost icon button
<Button variant="ghost" size="icon" aria-label="Settings">
  <Settings className="h-4 w-4" />
</Button>

// As a Next.js Link (via asChild)
<Button asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>

// Glow variant for primary CTAs
<Button variant="glow">Get Started</Button>
```

**Variants:** `default` | `destructive` | `outline` | `secondary` | `ghost` | `link` | `glow`
**Sizes:** `default` | `sm` | `lg` | `xl` | `icon`

---

## Input

Text input with error state support.

```tsx
import { Input } from "@/components/ui/input";

<Input
  type="email"
  placeholder="you@example.com"
  error={!!errors.email}
  aria-describedby="email-error"
/>;
{
  errors.email && (
    <p id="email-error" className="text-sm text-destructive">
      {errors.email}
    </p>
  );
}
```

---

## Textarea

Multi-line text input, mirrors Input API.

```tsx
import { Textarea } from "@/components/ui/textarea";

<Textarea placeholder="Write a description..." rows={4} error={!!errors.description} />;
```

---

## Label

Form label with variant support and required indicator.

```tsx
import { Label } from "@/components/ui/label";

<Label htmlFor="name" required>Full Name</Label>
<Label variant="muted">Optional field</Label>
<Label variant="error">This field has an error</Label>
```

---

## Badge

Status indicators with 8 variants and optional animation.

```tsx
import { Badge } from "@/components/ui/badge";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";

// Standard
<Badge variant="success">Active</Badge>
<Badge variant="destructive">Overdue</Badge>

// Animated (pulses on content change)
<Badge variant="info" animate>{count}</Badge>

// Semantic status helpers
<StatusBadge status="active" />
<PriorityBadge priority="high" />
```

---

## Card

Compound layout component with spatial depth.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Project Overview</CardTitle>
    <CardDescription>Summary of current status</CardDescription>
  </CardHeader>
  <CardContent>{/* Your content */}</CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>;
```

---

## Dialog

Modal dialog with mobile bottom-sheet behavior and swipe-to-dismiss.

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent size="md">
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>This cannot be undone.</DialogDescription>
    </DialogHeader>
    {/* Form content */}
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

**Sizes:** `sm` | `md` | `lg` | `xl` | `full`

---

## Select

Custom dropdown with full keyboard navigation and ARIA compliance.

```tsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

<Select value={status} onValueChange={setStatus}>
  <SelectTrigger>
    <SelectValue placeholder="Select status..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="active">Active</SelectItem>
    <SelectItem value="pending">Pending</SelectItem>
    <SelectItem value="closed">Closed</SelectItem>
  </SelectContent>
</Select>;
```

---

## Checkbox

Boolean toggle with Radix accessibility.

```tsx
import { Checkbox } from "@/components/ui/checkbox";

<div className="flex items-center gap-2">
  <Checkbox
    id="agree"
    checked={agreed}
    onCheckedChange={(checked) => setAgreed(checked === true)}
  />
  <Label htmlFor="agree">I agree to the terms</Label>
</div>;
```

---

## Toggle (Switch)

On/off toggle switch.

```tsx
import { Toggle } from "@/components/ui/toggle";

<Toggle checked={enabled} onCheckedChange={setEnabled} size="sm" />;
```

---

## Toast

Notification system via context provider.

```tsx
import { useToast } from "@/components/ui/toast";

function MyComponent() {
  const { addToast } = useToast();

  const handleSave = () => {
    addToast({
      title: "Changes saved",
      description: "Your project has been updated.",
      variant: "success",
    });
  };
}
```

**Variants:** `default` | `success` | `destructive` | `warning` | `info`

---

## Tooltip

Hover/focus tooltips.

```tsx
import { Tooltip } from "@/components/ui/tooltip";

<Tooltip content="Edit this project" side="top">
  <Button variant="ghost" size="icon">
    <Pencil className="h-4 w-4" />
  </Button>
</Tooltip>;
```

---

## Table

Semantic table components for data display.

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Project Alpha</TableCell>
      <TableCell>
        <Badge variant="success">Active</Badge>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>;
```

---

## TabBar

URL-synced tabbed navigation with scoping tab counts.

```tsx
import { TabBar, TabPanel } from "@/components/ui/tab-bar";

<TabBar
  tabs={[
    { key: "all", label: "All", count: 42 },
    { key: "active", label: "Active", count: 28 },
    { key: "archived", label: "Archived", count: 14 },
  ]}
  activeTab={currentTab}
  onTabChange={setCurrentTab}
/>
<TabPanel value="all">{/* Content */}</TabPanel>
```

---

## Accordion

Collapsible content sections.

```tsx
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

<Accordion type="single" collapsible>
  <AccordionItem value="details">
    <AccordionTrigger>View Details</AccordionTrigger>
    <AccordionContent>Expanded content here</AccordionContent>
  </AccordionItem>
</Accordion>;
```

---

## SearchInput

Debounced search input with clear button.

```tsx
import { SearchInput } from "@/components/ui/search-input";

<SearchInput
  value={search}
  onChange={setSearch}
  placeholder="Search projects..."
  debounceMs={300}
/>;
```

---

## ProgressBar

Visual progress indicator with semantic variants.

```tsx
import { ProgressBar } from "@/components/ui/progress-bar";

<ProgressBar value={75} max={100} variant="success" showLabel animate />;
```

---

## Sheet

Slide-over panel for detail views.

```tsx
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Open Panel</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Details</SheetTitle>
    </SheetHeader>
    {/* Content */}
  </SheetContent>
</Sheet>;
```

---

## Design Token Usage

### Colors — Always Use Tokens

```tsx
// ✅ Correct — semantic tokens
<div className="bg-primary text-primary-foreground" />
<div className="bg-destructive/10 text-destructive" />
<div className="bg-success text-success-foreground" />

// ❌ Wrong — hardcoded hex
<div className="bg-[#1a1a2e]" />   // Use bg-background
<div className="text-[#ef4444]" />  // Use text-destructive
```

### Z-Index — Use CSS Custom Properties

```tsx
// ✅ Correct
className = "z-[var(--z-overlay)]";
className = "z-[var(--z-modal)]";

// ❌ Wrong
className = "z-[9999]";
className = "z-[60]";
```

### Transitions — Use Motion Tokens

```tsx
// ✅ Correct — references design token timing
className="transition-colors duration-fast"

// In CSS
transition: color var(--duration-fast) var(--ease-out-expo);
```

---

## Icon Usage

**Library:** `lucide-react` exclusively.

```tsx
import { Settings, ChevronDown, AlertCircle } from "lucide-react";

// Standard sizing
<Settings className="h-4 w-4" />

// In buttons — auto-sized via [&_svg]:size-4
<Button><Settings /> Settings</Button>
```

Never import from `react-icons`, `heroicons`, or `@radix-ui/react-icons`.
