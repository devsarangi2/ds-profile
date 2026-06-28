# Design System — DS Profile

A comprehensive design system for the DS Profile Management Dashboard.
LinkedIn-inspired but cleaner, professional, and developer-focused.

---

## 1. Design Philosophy

The interface should feel like a high-quality professional tool rather than a social network.
Key principles:

- **Data density without clutter** — Show meaningful information without overwhelming whitespace or visual noise.
- **Progressive disclosure** — Summary first, detail on demand. Edit controls appear on focus/hover.
- **Trust through consistency** — Every interactive element behaves the same way. Hover states, focus rings, and transitions are uniform.
- **Content is the hero** — Typography and layout serve the profile content, not the UI chrome.
- **Professional restraint** — Use color sparingly. Primary blue for action, neutral gray for structure, semantic colors only for status.

---

## 2. Color Tokens

All tokens are defined as CSS custom properties using the `rgb()` channel format so they can be
composed with opacity: `rgb(var(--color-primary) / 0.1)`.

### Primary (Blue)

| Token | Value | Description |
|---|---|---|
| `--color-primary` | `37 99 235` | blue-600 — main CTA, links, active states |
| `--color-primary-hover` | `29 78 216` | blue-700 — hover state |
| `--color-primary-active` | `30 64 175` | blue-800 — pressed state |
| `--color-primary-subtle` | `239 246 255` | blue-50 — tinted backgrounds |
| `--color-primary-border` | `191 219 254` | blue-200 — subtle borders on primary-tinted surfaces |

### Neutrals (Slate)

| Token | Light | Dark | Description |
|---|---|---|---|
| `--color-bg` | `255 255 255` | `10 15 28` | Page background |
| `--color-surface` | `248 250 252` | `17 24 39` | Card / panel surface |
| `--color-surface-raised` | `241 245 249` | `31 41 55` | Elevated surface (dropdown, modal) |
| `--color-border` | `226 232 240` | `55 65 81` | Default border |
| `--color-border-strong` | `203 213 225` | `75 85 99` | Emphasis border |
| `--color-text` | `15 23 42` | `248 250 252` | Primary text |
| `--color-text-muted` | `100 116 139` | `148 163 184` | Secondary text, labels |
| `--color-text-subtle` | `148 163 184` | `100 116 139` | Placeholder, disabled text |

### Semantic

| Token | Value | Usage |
|---|---|---|
| `--color-success` | `22 163 74` | Saved confirmations, positive diff |
| `--color-success-subtle` | `240 253 244` | Success tinted backgrounds |
| `--color-warning` | `217 119 6` | Pending states, low confidence AI |
| `--color-warning-subtle` | `255 251 235` | Warning tinted backgrounds |
| `--color-error` | `220 38 38` | Validation errors, negative diff |
| `--color-error-subtle` | `254 242 242` | Error tinted backgrounds |
| `--color-info` | `37 99 235` | (same as primary) Informational notices |

### Dark mode semantic overrides

| Token | Dark value |
|---|---|
| `--color-success-subtle` | `20 83 45` |
| `--color-warning-subtle` | `120 53 15` |
| `--color-error-subtle` | `127 29 29` |
| `--color-primary-subtle` | `23 37 84` |
| `--color-primary-border` | `30 58 138` |

---

## 3. Typography

### Font Stack

```
Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
Roboto, "Helvetica Neue", Arial, sans-serif
```

Inter is loaded from Google Fonts or self-hosted via `@fontsource/inter`. Fall back to
system-ui so text renders correctly even before the webfont loads.

### Size Scale

| Name | Size | Line Height | Usage |
|---|---|---|---|
| `text-xs` | 12px | 1.5 | Metadata, timestamps, micro-labels |
| `text-sm` | 14px | 1.5 | Body secondary, form labels |
| `text-base` | 16px | 1.6 | Body primary |
| `text-lg` | 18px | 1.5 | Card titles, emphasized body |
| `text-xl` | 20px | 1.4 | Section headings |
| `text-2xl` | 24px | 1.3 | Page sub-headings |
| `text-3xl` | 30px | 1.2 | Profile name |
| `text-4xl` | 36px | 1.1 | Hero / cover area name |

### Weights

| Name | Value | Usage |
|---|---|---|
| Regular | 400 | Body, descriptions |
| Medium | 500 | Labels, secondary headings |
| Semibold | 600 | Card titles, nav items |
| Bold | 700 | Primary headings, profile name |

### Tracking

- Headings (`text-2xl` and above): `tracking-tight` (−0.025em)
- Labels and metadata: `tracking-wide` (+0.025em)

---

## 4. Spacing

Base unit: **4px**. All spacing values are multiples of this base.

| Scale step | Value | Tailwind class |
|---|---|---|
| 1 | 4px | `p-1`, `gap-1` |
| 2 | 8px | `p-2`, `gap-2` |
| 3 | 12px | `p-3`, `gap-3` |
| 4 | 16px | `p-4`, `gap-4` |
| 5 | 20px | `p-5`, `gap-5` |
| 6 | 24px | `p-6`, `gap-6` |
| 8 | 32px | `p-8`, `gap-8` |
| 10 | 40px | `p-10` |
| 12 | 48px | `p-12` |
| 16 | 64px | `p-16` |
| 20 | 80px | `p-20` |
| 24 | 96px | `p-24` |

**Component-level conventions:**

- Card internal padding: `p-6` (24px)
- Section gap within a card: `gap-4` (16px)
- Form field gap: `gap-3` (12px)
- Sidebar nav item padding: `px-3 py-2`
- Top nav height: 56px (`h-14`)
- Sidebar width (expanded): 240px; collapsed: 64px

---

## 5. Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 4px | Chips, badges, small inputs |
| `--radius-md` | 8px | Buttons, input fields, cards |
| `--radius-lg` | 12px | Cards, panels |
| `--radius-xl` | 16px | Modals, large cards |
| `--radius-full` | 9999px | Avatars, pill badges |

---

## 6. Shadows

Shadows use layered box-shadows. The first layer anchors the element; the second adds depth.

### Light mode

| Name | Value |
|---|---|
| `shadow-sm` | `0 1px 2px rgb(0 0 0 / 0.05)` |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)` |
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)` |
| `shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)` |

### Dark mode (additive glow replaced by inset border)

In dark mode, shadows are supplemented with a `ring-1 ring-white/10` border to separate surfaces
from the background. Shadow opacity is halved.

| Name | Dark value |
|---|---|
| `shadow-sm` | `0 1px 2px rgb(0 0 0 / 0.3)` |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)` |
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.3)` |

---

## 7. Component Inventory

### Sidebar

A collapsible left-rail navigation present on all authenticated routes.

**Props/variants:**

| Prop | Type | Default | Notes |
|---|---|---|---|
| `collapsed` | boolean | false | Collapses to icon-only (64px wide) |
| `activeRoute` | string | — | Highlights the matching nav item |

**Anatomy:**

- Logo lockup at top (collapsed = icon only)
- Nav items: icon + label. Active item gets primary-blue background tint and bold label.
- Bottom section: avatar thumbnail + "Settings" link
- Collapse toggle button at bottom of rail

**States:** default, hover (`surface-raised` bg), active (primary-subtle bg + primary text), collapsed (tooltip on hover)

**Mobile behavior:** Sidebar is hidden. Bottom tab bar appears with 4 primary nav icons.

---

### TopNav

Sticky header bar above main content area.

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `breadcrumbs` | `{label, href}[]` | Rendered as `Home / Employment / Acme Corp` |
| `userAvatarUrl` | string | Falls back to initials avatar |
| `notificationCount` | number | Badge on bell icon; hidden when 0 |

**Anatomy:** left = breadcrumb trail; right = notification bell + avatar dropdown

---

### ProfileCard

The hero card at the top of the profile page.

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `coverUrl` | string | 16:5 aspect banner image |
| `avatarUrl` | string | Circle, overlaps cover bottom by 50% |
| `name` | string | `text-3xl font-bold` |
| `headline` | string | `text-lg text-muted` |
| `location` | string | With map-pin icon |
| `editMode` | boolean | Shows inline edit fields for all text |

**Layout:** Cover image (full width, 192px tall) → avatar overlapping at bottom-left → name/headline below.

**Edit mode:** Each text field becomes an `InlineEdit` component. Cover and avatar get upload overlays.

---

### TimelineCard

Represents a single employment or education entry in a chronological list.

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `employer` | string | Bold, `text-lg` |
| `role` | string | `text-base text-muted` |
| `startDate` | string | ISO date |
| `endDate` | string \| null | null = "Present" |
| `logoUrl` | string | 40×40 company logo |
| `description` | string | Collapsible after 3 lines |

**Anatomy:** Left column = vertical dot-connector line + logo circle; Right column = role text + date badge + description.

**Date badge:** pill shape, `bg-surface-raised text-text-muted text-xs`, format `MMM YYYY – MMM YYYY (Xyr Xmo)`.

---

### ProjectCard

Card representing a project in the projects grid or list.

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `name` | string | Bold title |
| `description` | string | Truncated to 2 lines with read-more |
| `roleTag` | string | e.g. "Lead Engineer" — colored badge |
| `techChips` | string[] | Technology stack chips |
| `startDate` | string | |
| `endDate` | string \| null | |

**Tech chips:** `TagChip` components in readonly variant, wrapped in a flex-wrap row.

---

### InlineEdit

A component that toggles between a read state and an edit state in place.

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `value` | string | Current text value |
| `onSave` | (v: string) => Promise | Called on blur or Enter |
| `multiline` | boolean | false = `<input>`, true = `<textarea>` |
| `placeholder` | string | Shown in empty read state |

**States:**

1. **Read** — renders plain text with a faint pencil icon on hover
2. **Edit** — input/textarea with border + focus ring, Save and Cancel buttons
3. **Saving** — spinner inline with Save button, input disabled
4. **Error** — red border, error message below field

---

### AIImproveButton

A button that triggers AI-assisted text improvement.

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `fieldName` | string | e.g. "headline", "summary" |
| `currentValue` | string | Text to improve |
| `onApply` | (improved: string) => void | Called when user accepts suggestion |

**Variants:** icon-only (compact, inline with InlineEdit), full button (standalone below field)

**States:** default, loading (spinner), has-suggestion (highlighted ring)

---

### AISuggestionModal

Modal showing the before/after diff of an AI text improvement.

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `original` | string | Existing text |
| `suggested` | string | AI-generated text |
| `onApply` | () => void | |
| `onDiscard` | () => void | |
| `loading` | boolean | Skeleton content while AI responds |

**Layout:** Two-column diff view (original left, suggested right) on desktop; stacked on mobile.
Footer: "Discard" (ghost) + "Apply suggestion" (primary).

---

### TagChip

Small pill label for skills, technologies, or categories.

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `label` | string | |
| `variant` | `"default"` \| `"primary"` \| `"success"` \| `"warning"` | Color scheme |
| `dismissible` | boolean | Shows × button |
| `onDismiss` | () => void | Called when × clicked |

**Sizes:** default (`text-xs px-2 py-0.5`), large (`text-sm px-3 py-1`)

---

### AvatarUploader

Circular drag-drop zone for profile avatar images.

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `currentUrl` | string \| null | Shown as preview |
| `onUpload` | (file: File) => Promise<string> | Must resolve to new URL |
| `size` | number | Diameter in px, default 96 |

**States:** idle (current avatar + camera icon overlay on hover), dragging (blue dashed border), uploading (spinner overlay), error (red border + message).

---

### CoverUploader

Full-width drag-drop zone for the profile cover banner.

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `currentUrl` | string \| null | Shown as preview |
| `onUpload` | (file: File) => Promise<string> | Must resolve to new URL |
| `aspectRatio` | string | default `"16/5"` |

**States:** Same as AvatarUploader. Edit pencil icon appears top-right corner on hover.

---

### PDFDropzone

Handles PDF resume import flow.

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `onParsed` | (diff: ProfileDiff) => void | Called when server returns parsed data |

**States:**

1. **Idle** — dashed border zone, cloud-upload icon, "Drop your resume PDF here or click to browse"
2. **Uploading** — progress bar, filename displayed
3. **Parsing** — spinner, "Extracting content..." message
4. **Complete** — `DiffView` rendered below with parsed results
5. **Error** — red border, error message, retry button

---

### DiffView

Renders a structured diff between existing profile data and imported/AI-suggested data.

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `diff` | `ProfileDiff` | Typed diff object per section |
| `onApplySection` | (section: string) => void | Apply just one section |
| `onApplyAll` | () => void | Apply all changes |
| `onDismiss` | () => void | Discard all |

**Visual encoding:**

- New / added content: green background `bg-green-50 dark:bg-green-950`, `+` prefix
- Removed / replaced content: red background `bg-red-50 dark:bg-red-950`, `−` prefix  
- Unchanged context: muted text, no background

---

## 8. Dark / Light Mode Strategy

### Mechanism

Dark mode is toggled by adding or removing the `.dark` class on `<html>`.

```ts
// Toggle
document.documentElement.classList.toggle("dark");

// Persist
localStorage.setItem("theme", document.documentElement.classList.contains("dark") ? "dark" : "light");

// On load (in <head>, before first paint)
const saved = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
if (saved === "dark" || (!saved && prefersDark)) {
  document.documentElement.classList.add("dark");
}
```

### CSS approach

- All color tokens are defined as `--color-*` custom properties under `:root` (light) and `.dark` (dark).
- Tailwind's `darkMode: "class"` mode is used. All dark-mode utilities are `dark:*`.
- Semantic component colors always reference tokens, never hardcoded values.

### Transition

```css
html {
  transition: background-color 150ms ease, color 150ms ease;
}
```

---

## 9. Responsive Breakpoints

| Name | Min width | Notes |
|---|---|---|
| `sm` | 640px | Two-column layouts possible |
| `md` | 768px | Sidebar visible (collapsed) |
| `lg` | 1024px | Sidebar expanded, full desktop layout |
| `xl` | 1280px | Wider content area, two-column project grid |
| `2xl` | 1536px | Max content width capped at 1280px |

### Layout changes

| Breakpoint | Sidebar | Content layout |
|---|---|---|
| < md (mobile) | Hidden — bottom tab bar (4 items) | Single column, full width |
| md–lg | Collapsed icon-only rail (64px) | Single column |
| lg+ | Expanded (240px) | Multi-column possible |

**Mobile bottom nav:** Home, Experience, Projects, Settings. Fixed bottom, `h-16`, bg-surface + border-top.

**Max content width:** `max-w-5xl mx-auto` (1024px) with `px-4 md:px-6 lg:px-8` horizontal padding.

---

## 10. Animation and Motion

### Guiding principle

Motion should orient the user, not entertain them. Use duration values at the low end of perceptible.

### Durations

| Use case | Duration | Easing |
|---|---|---|
| Hover states (color, bg) | 150ms | `ease` |
| Focus ring appearance | 100ms | `ease-out` |
| Modal/dialog enter | 200ms | `ease-out` |
| Modal/dialog exit | 150ms | `ease-in` |
| Sidebar expand/collapse | 250ms | `ease-in-out` |
| Toast / notification | 200ms enter, 150ms exit | `ease-out` / `ease-in` |
| Data loads | None | — (use skeleton placeholders, no fade-in) |
| Page transitions | None | — (instant navigation) |

### CSS tokens

```css
--duration-fast: 100ms;
--duration-base: 150ms;
--duration-slow: 200ms;
--duration-slower: 250ms;
--ease-default: ease;
--ease-enter: ease-out;
--ease-exit: ease-in;
```

### Skeleton placeholders

Use a CSS shimmer animation for loading states. Do NOT animate actual data after it loads.

```css
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position:  200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgb(var(--color-surface)) 25%,
    rgb(var(--color-surface-raised)) 50%,
    rgb(var(--color-surface)) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}
```

### Reduced motion

All transitions and animations must respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```
