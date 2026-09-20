---
author: Ulises Gómez
publishDate: 2026-04-08T10:00:00Z
title: "Tailwind CSS Reference: Configuration, cn(), Dark Mode & Design System"
tags:
    - Tailwind CSS
    - CSS
    - Design System
    - Frontend
description: Quick reference for Tailwind CSS (v3 config with v4 equivalents). How tree-shaking works, CSS variables for theming, the cn() pattern (clsx + tailwind-merge), dark mode strategies, @layer, and responsive design. Interview Q&A included.
cover:
  src: './images/covers/tailwind-design-system.webp'
  alt: 'Tailwind CSS design system'
---

## Quick Reference

- Tailwind **scans your files at build time** and generates only the CSS for classes you use, no unused CSS ships
- Breakpoints are **min-width** (mobile-first): `sm:`, `md:`, `lg:`, `xl:` add styles from that size upward
- `cn()` = `clsx` (conditional classes) + `tailwind-merge` (resolve conflicting utilities like `p-2 p-4`)
- CSS variables in the config let you change themes at runtime without regenerating CSS
- `darkMode: 'selector'` (formerly `'class'`) → you control when dark mode activates. `darkMode: 'media'` → follows OS preference
- `@layer components` is where you put repeated patterns that deserve a semantic name

> **Version note:** the config examples use Tailwind **v3** (`tailwind.config.js`). Tailwind **v4** moved configuration into CSS (`@import "tailwindcss"`, `@theme`, `@custom-variant`), so each section shows the v4 equivalent where it differs.

---

## How does Tailwind tree-shake?

Tailwind doesn't ship a full CSS file. It scans your source files for class names and generates only what's actually used:

```javascript
// tailwind.config.mjs
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,mdx}'],
  // ↑ Tailwind scans these files. Any class found here gets CSS generated.
  // Any class NOT found gets nothing generated.
}
```

> **v4:** there's no `content` array. Tailwind scans your project automatically (respecting `.gitignore`); add extra sources with `@source "../node_modules/some-ui-lib"` in your CSS.

The result: a few kilobytes of CSS instead of megabytes. This is why you can't construct class names dynamically with string concatenation, the string won't be in the source file for Tailwind to detect.

```javascript
// ❌ Tailwind won't find this class at build time
const color = 'blue'
<div className={`text-${color}-500`} />

// ✅ Full class name must appear in source
<div className="text-blue-500" />
```

---

## How do you build a design system with Tailwind?

Define tokens in the config, reference them via CSS variables so they work with runtime theme switching. In v3 the variables must hold **color channels** (`30 136 229`) and the config wraps them with the `<alpha-value>` placeholder. If you use a full color instead (`var(--color-primary)` holding `#1E88E5`), Tailwind can't inject the alpha, and utilities like `bg-primary/90` or `hover:bg-primary/90` silently generate nothing.

```javascript
// tailwind.config.mjs (v3)
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
        hover: 'rgb(var(--color-primary-hover) / <alpha-value>)',
        foreground: 'rgb(var(--color-primary-fg) / <alpha-value>)',
      },
      background: 'rgb(var(--color-background) / <alpha-value>)',
      foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
      card: 'rgb(var(--color-card) / <alpha-value>)',
      border: 'rgb(var(--color-border) / <alpha-value>)',
    },
    borderRadius: {
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
    },
  },
}
```

```css
/* globals.css (v3): space-separated RGB channels */
:root {
  --color-primary: 30 136 229;        /* #1E88E5 */
  --color-primary-hover: 21 101 192;  /* #1565C0 */
  --color-primary-fg: 255 255 255;
  --color-background: 255 255 255;
  --color-foreground: 10 10 10;
  --color-card: 250 250 250;
  --color-border: 229 229 229;
  --radius: 0.5rem;
}

.dark {
  --color-primary: 130 177 255;       /* #82B1FF */
  --color-primary-hover: 68 138 255;  /* #448AFF */
  --color-background: 10 10 10;
  --color-foreground: 250 250 250;
  --color-card: 23 23 23;
  --color-border: 38 38 38;
}
```

When the `.dark` class is added to `<html>`, all variables update and every component that uses `bg-primary` or `text-foreground` updates automatically, no class changes needed in the components.

**The same design tokens in Tailwind v4** live entirely in CSS, and opacity modifiers (`bg-primary/90`) work with plain colors, no channel tricks:

```css
/* app.css (v4): no tailwind.config file needed */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --primary: #1E88E5;
  --primary-hover: #1565C0;
  --primary-foreground: #ffffff;
  --background: #ffffff;
  --foreground: #0a0a0a;
  --radius: 0.5rem;
}

.dark {
  --primary: #82B1FF;
  --primary-hover: #448AFF;
  --background: #0a0a0a;
  --foreground: #fafafa;
}

/* Map the variables to Tailwind tokens: bg-primary, text-foreground, rounded-lg… */
@theme inline {
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-primary-foreground: var(--primary-foreground);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
}
```

---

## What is the cn() pattern and why does it exist?

Two libraries solving two distinct problems:

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### clsx, conditional class application

```typescript
// Without clsx
const cls = `base ${isActive ? 'bg-blue-500' : 'bg-gray-200'} ${isDisabled ? 'opacity-50' : ''}`

// With clsx
const cls = clsx('base', {
  'bg-blue-500': isActive,
  'bg-gray-200': !isActive,
  'opacity-50': isDisabled,
})
```

### tailwind-merge, resolve utility conflicts

```typescript
// Without twMerge: both classes stay in the string; the winner is decided by their order
// in the generated stylesheet, not by their order in your class string
clsx('p-2 p-4')  // → 'p-2 p-4'

// With twMerge: intelligently resolves conflicts
twMerge('p-2 p-4')  // → 'p-4'
```

### The real use case, overridable component defaults

```typescript
function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn('bg-blue-500 text-white px-4 py-2 rounded-lg', className)}
      {...props}
    />
  )
}

// Without cn(): parent's bg-red-500 coexists with bg-blue-500: bug
// With cn(): twMerge resolves → only bg-red-500 applies
<Button className="bg-red-500" />
```

---

## How does dark mode work?

```javascript
// tailwind.config.mjs (v3): choose one strategy
darkMode: 'media'     // follows OS preference automatically
darkMode: 'selector'  // you control it by toggling .dark on <html> (v3.4.1+; 'class' is the older name and still works)
```

```css
/* v4: dark: follows the OS by default. For a manual toggle, redefine the variant: */
@custom-variant dark (&:where(.dark, .dark *));
```

With either strategy, dark variants work the same way in markup:

```html
<div class="bg-white dark:bg-gray-900 text-black dark:text-white">
  Content
</div>
```

**Which to choose:** use a class-based strategy (`'selector'`/`'class'` in v3, `@custom-variant` in v4) for apps where the user should be able to toggle dark mode manually. Use `'media'` (the v4 default) for sites where you just want to respect the OS setting without a toggle.

---

## When do you use @layer?

`@layer` places custom CSS in the correct cascade layer so Tailwind utilities can always override it:

```css
@tailwind base;       /* HTML element resets */
@tailwind components; /* reusable classes */
@tailwind utilities;  /* individual utilities */

/* Global element styles */
@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}

/* Reusable semantic classes */
@layer components {
  .btn-primary {
    @apply bg-primary text-primary-foreground px-4 py-2 rounded-lg
           hover:bg-primary/90 transition-colors;
  }
  .card {
    @apply bg-card border border-border rounded-lg shadow-sm p-4;
  }
}
```

> **v4:** replace the three `@tailwind` lines with a single `@import "tailwindcss";`. `@layer base` and `@layer components` still work, and `@utility` lets you define custom utilities that support variants (`hover:`, `md:`) out of the box.

**When to use `@apply` vs direct utilities:** use `@apply` for patterns that repeat in many places and deserve a name (`.btn-primary`, `.card`). Use direct utilities for one-off styles specific to a single component.

---

## How does responsive design work in Tailwind?

Every breakpoint prefix is a `min-width` media query, styles apply from that size upward:

```
No prefix  → all sizes (mobile base)
sm:        → 640px and up
md:        → 768px and up
lg:        → 1024px and up
xl:        → 1280px and up
```

```html
<!-- 1 column on mobile, 2 on tablet, 3 on desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  ...
</div>

<!-- Hide/show for different sizes -->
<button class="block md:hidden">Hamburger</button>
<nav class="hidden md:flex gap-6">Full nav</nav>
```

---

## Common Interview Questions

**Q: What is tree-shaking in Tailwind?**
**A:** Tailwind scans source files at build time and generates CSS only for the classes it finds. No unused utilities ship. That's why you can't build class names with string interpolation, the dynamic result won't be scanned.

**Q: What problem does `tailwind-merge` solve that `clsx` can't?**
**A:** `clsx` only concatenates strings with conditional logic, it knows nothing about Tailwind semantics. `tailwind-merge` understands which Tailwind utilities are mutually exclusive (`p-2` vs `p-4`) and resolves conflicts by keeping the last one. Without it, both `p-2` and `p-4` would be in the class string and the browser would apply whichever is defined later in the generated stylesheet (not the one you wrote last), which is hard to reason about.

**Q: `darkMode: 'media'` vs `darkMode: 'class'`: what's the difference?**
**A:** `media` uses the `prefers-color-scheme` CSS media query, automatic with no JavaScript. `selector` (formerly `class`) requires adding/removing a `.dark` class on `<html>`, usually via JavaScript, which gives the user a manual toggle. Apps that offer a theme toggle use the class-based strategy (in v4, a `@custom-variant`).

**Q: When would you use `@apply` instead of direct utility classes?**
**A:** When a combination of utilities is used in many places and deserves a semantic name for readability, like `.btn-primary` or `.card`. For one-off styles in a single component, direct utilities are clearer.

---

## Common Mistakes

**1. Building class names dynamically**: Tailwind won't detect them at build time.
```javascript
// ❌
`text-${color}-500`  // Tailwind doesn't scan interpolated strings
// ✅
color === 'blue' ? 'text-blue-500' : 'text-red-500'
```

**2. Using `p-2 p-4` without tailwind-merge**: both classes exist in the string and the winner is decided by stylesheet order, not by the order in your class string. Always use `cn()`.

**3. Skipping the `content` config**: Tailwind won't scan files you don't list. New directories or file extensions need to be added.

**4. `darkMode: 'media'` with a toggle button**: you can't override a CSS media query with a class toggle. If you want a user toggle, use a class-based strategy (`'selector'`/`'class'` in v3, `@custom-variant` in v4).

---

## Cheat Sheet

```javascript
// ── Config (v3) ───────────────────────────────────────
// tailwind.config.mjs
{
  content: ['./src/**/*.{astro,tsx,ts,html,mdx}'],
  darkMode: 'selector',  // or 'media' ('class' also works)
  theme: {
    extend: {
      colors: { primary: 'rgb(var(--color-primary) / <alpha-value>)' },
      borderRadius: { lg: 'var(--radius)' },
    },
  },
}
```

```css
/* ── Config (v4): CSS-first, no tailwind.config needed ── */
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
@theme inline {
  --color-primary: var(--primary);
  --radius-lg: var(--radius);
}
```

```typescript
// ── cn() utility ──────────────────────────────────────
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
cn('p-2 text-sm', isActive && 'bg-blue-500', className)
```

```html
<!-- ── Responsive ────────────────────────────────────── -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

<!-- ── Dark mode ─────────────────────────────────────── -->
<div class="bg-white dark:bg-gray-900 text-black dark:text-white">

<!-- ── Show/hide ─────────────────────────────────────── -->
<div class="block md:hidden">mobile only</div>
<div class="hidden md:block">desktop only</div>

<!-- ── Prose (typography plugin) ─────────────────────── -->
<article class="prose dark:prose-invert max-w-none">
```

```css
/* ── @layer (v3: after the three @tailwind lines; v4: after @import "tailwindcss") ── */
@layer base {
  body { @apply bg-background text-foreground; }
}
@layer components {
  .btn { @apply px-4 py-2 rounded-lg transition-colors; }
}
```
