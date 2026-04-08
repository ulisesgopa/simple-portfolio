---
author: Ulises Gómez
publishDate: 2025-03-20T10:00:00Z
title: Tailwind CSS — The System Behind This Portfolio
tags:
    - Tailwind CSS
    - CSS
    - Design System
    - Frontend
description: How Tailwind works beyond utility classes — the configuration system, the cn() pattern, dark mode, and why this portfolio uses these specific patterns.
cover:
  src: './images/customizing-theme-color-schemes/cover.webp'
  alt: 'Tailwind CSS design system'
---

## Tailwind Is Not Just Long Class Names

The most common complaint about Tailwind is that the HTML looks "messy". That's true if it's not structured well. Tailwind applied properly is a **design system in code** — centralized configuration, reusable tokens, and composition patterns.

This post explains how the system behind this portfolio and my other projects is built.

---

## How Tailwind Works Internally

Tailwind scans your files and generates only the CSS you actually use (tree-shaking at build time). It doesn't load a giant CSS file — it generates exactly the utilities that appear in your code.

```javascript
// tailwind.config.mjs — the heart of the system
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  // ↑ Tailwind scans these files to know what to generate

  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E88E5',
          hover: '#1565C0',
        }
      }
    }
  }
}
```

---

## The Portfolio's Configuration — What Each Part Does

```javascript
// tailwind.config.mjs
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: 'var(--color-primary)',  // references a CSS variable
        hover: 'var(--color-primary-hover)',
      },
    },
    borderRadius: {
      lg: 'var(--radius)',      // border radius system via CSS vars
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
    },
  }
}
```

**Why CSS variables instead of direct values?**

It allows changing the theme at runtime (dark mode, custom themes) without regenerating the CSS. The variable value changes, Tailwind already generated the class, the change applies instantly.

```css
/* globals.css */
:root {
  --color-primary: #1E88E5;
  --color-primary-hover: #1565C0;
  --radius: 0.5rem;
}

.dark {
  --color-primary: #82B1FF;  /* same token, different value in dark mode */
  --color-primary-hover: #448AFF;
}
```

---

## The `cn()` Pattern — Why It Exists and What It Does

This portfolio uses a utility called `cn()` from the shadcn/ui ecosystem:

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Two libraries solving two different problems:

### `clsx` — Conditional Classes

```typescript
// Without clsx
const className = `base-class ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`

// With clsx — much more readable
const className = clsx('base-class', {
  'active': isActive,
  'disabled': isDisabled,
})

// Also accepts arrays and strings
const className = clsx('p-4', isLarge && 'text-lg', ['rounded', 'shadow'])
```

### `twMerge` — Deduplicating Conflicting Utilities

```typescript
// Without twMerge — Tailwind doesn't know which one wins
clsx('p-2 p-4') // result: 'p-2 p-4' — both applied, last in CSS wins
                // bug: Tailwind's CSS doesn't guarantee order

// With twMerge — resolves the conflict intelligently
twMerge('p-2 p-4') // result: 'p-4' — last one wins, clean

// The real use case: overriding props in components
function Button({ className, ...props }) {
  return (
    <button
      className={cn('bg-blue-500 text-white px-4 py-2', className)}
      //                  ↑ default       ↑ parent override
      {...props}
    />
  )
}

// Without cn(): Button with className="bg-red-500" would have BOTH bg-blue-500 AND bg-red-500
// With cn(): twMerge resolves the conflict → only bg-red-500
<Button className="bg-red-500" />
```

---

## Dark Mode — How It Works in This Portfolio

```javascript
// tailwind.config.mjs
darkMode: 'media' // uses the user's operating system preference
// alternative: 'class' — controlled by a class on the HTML element (manual toggle)
```

With `darkMode: 'media'`, Tailwind generates `dark:` variants that activate automatically when the system is in dark mode:

```html
<div class="bg-white dark:bg-gray-900 text-black dark:text-white">
  Content that changes with the system theme
</div>
```

---

## The `@layer` Directive — When to Write Your Own CSS

Tailwind has three layers processed in order: `base`, `components`, `utilities`.

```css
/* globals.css */
@tailwind base;       /* reset + HTML element styles */
@tailwind components; /* reusable component classes */
@tailwind utilities;  /* individual utility classes */

/* Extending base — global HTML styles */
@layer base {
  * {
    @apply border-border; /* applies a Tailwind class to all elements */
  }
}

/* Extending components — reusable composed classes */
@layer components {
  .btn-primary {
    @apply bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover;
  }
}
```

**Why use `@layer` instead of plain CSS?**

Layers respect specificity correctly. A `@layer utilities` rule can always be overridden by a Tailwind utility class. Without `@layer`, rules compete on specificity and you get unexpected results.

---

## Responsive Design with Tailwind — Mobile First

Breakpoint prefixes are **min-width** — the style applies from that size upward:

```html
<!-- Base: 1 column (mobile) -->
<!-- md (768px+): 2 columns -->
<!-- lg (1024px+): 3 columns -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  ...
</div>
```

---

## Prose with `@tailwindcss/typography`

The `typography` plugin adds the `prose` class to automatically format HTML/Markdown content. This blog uses it:

```html
<article class="prose dark:prose-invert max-w-none">
  <!-- Rendered Markdown gets styles automatically -->
  <!-- h1, h2, p, code, blockquote, ul, ol — all typeset -->
</article>
```

`prose-invert` is the dark mode version — it inverts colors for dark backgrounds.

---

## What I Should Be Able to Explain in Interviews

1. **What is tree-shaking in Tailwind?** — Tailwind scans your files at build time and generates only the CSS for classes you actually use. The final bundle is minimal compared to a full CSS framework.

2. **When would you use `@apply` vs a direct utility class?** — `@apply` for patterns that repeat in many places and I want to name semantically (`.btn-primary`). Direct classes for one-off styles specific to a component.

3. **The difference between `darkMode: 'media'` and `darkMode: 'class'`?** — `media` respects the system preference automatically. `class` requires JavaScript to add the `.dark` class to `<html>`, which allows a manual toggle. Most modern apps use `class` to give the user control.

4. **What problem does `tailwind-merge` solve that `clsx` can't?** — `clsx` only concatenates strings with conditional logic. It knows nothing about Tailwind. `tailwind-merge` understands which Tailwind utilities are mutually exclusive and resolves conflicts (`p-2 p-4` → `p-4`).

---

## Resources to Go Deeper

- [Tailwind Docs: Configuration](https://tailwindcss.com/docs/configuration)
- [Tailwind Docs: Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [tailwind-merge](https://github.com/dcastil/tailwind-merge)
- [clsx](https://github.com/lukeed/clsx)
