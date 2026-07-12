---
author: Ulises Gómez
publishDate: 2026-05-26T10:00:00Z
title: "Mobile-First Reference — Responsive Design, Breakpoints & Audit"
tags:
    - CSS
    - Tailwind CSS
    - Responsive Design
    - Mobile First
description: Quick reference for mobile-first responsive design. min-width vs max-width, Tailwind breakpoints, responsive patterns for nav, grids, and hero sections, common mistakes, and how to audit your own work.
cover:
  src: './images/customizing-user-information/cover.webp'
  alt: 'Mobile First Responsive Design'
---

## Quick Reference

- **Mobile-first** means base styles target the smallest viewport. Breakpoints **add** styles for larger screens — they never remove
- Tailwind breakpoints are **min-width**: `md:` = "768px and up". Unprefixed classes apply to all sizes
- Start designing at **375px** (smallest common phone). Desktop is the enhancement, not the default
- `max-width` + `mx-auto` on containers prevents content from stretching too wide on large screens
- Touch targets need a minimum of **44×44px** (WCAG guideline)
- The viewport meta tag is **required** — without it, mobile devices render at desktop width

---

## Mobile-first vs desktop-first — what's the actual difference?

It's the **direction of media queries**:

```css
/* ❌ Desktop-first — base is desktop, mobile is a correction */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);  /* desktop default */
}
@media (max-width: 768px) {
  .grid { grid-template-columns: 1fr; }  /* override for mobile */
}

/* ✅ Mobile-first — base is mobile, desktop is an enhancement */
.grid {
  display: grid;
  grid-template-columns: 1fr;            /* mobile default */
}
@media (min-width: 768px) {
  .grid { grid-template-columns: repeat(3, 1fr); }  /* add for desktop */
}
```

Mobile-first produces **enhancement code** (adding capabilities). Desktop-first produces **correction code** (removing or overriding). Enhancement is more maintainable.

---

## How do Tailwind's breakpoints work?

Every Tailwind breakpoint prefix applies **from that width upward**:

| Prefix | Min-width | Typical target |
|--------|-----------|----------------|
| *(none)* | 0px | Mobile base |
| `sm:` | 640px | Large phone |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Laptop |
| `xl:` | 1280px | Desktop |
| `2xl:` | 1536px | Wide desktop |

```html
<!-- Read as: "1 col always, 2 cols from md, 3 cols from lg" -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

<!-- "block on mobile (hamburger), flex on desktop (full nav)" -->
<button class="block md:hidden">☰</button>
<nav class="hidden md:flex gap-6">...</nav>
```

---

## What are the common responsive patterns?

### Navbar

```html
<!-- Mobile: logo + hamburger -->
<!-- Desktop: logo + links + CTA -->
<header class="flex items-center justify-between px-4 py-3 md:px-8">
  <Logo />

  <!-- Hamburger — mobile only -->
  <button class="block md:hidden" onClick={toggleMenu}>
    <MenuIcon />
  </button>

  <!-- Links — desktop only -->
  <nav class="hidden md:flex items-center gap-6">
    <a href="/about">About</a>
    <a href="/projects">Projects</a>
    <Button>Contact</Button>
  </nav>
</header>

<!-- Mobile drawer -->
{isOpen && (
  <div class="block md:hidden border-t px-4 py-3 space-y-2">
    <a class="block py-2" href="/about">About</a>
    <a class="block py-2" href="/projects">Projects</a>
  </div>
)}
```

### Hero with image

```html
<!-- Mobile: stack (image top, text bottom) -->
<!-- Desktop: split (text left, image right) -->
<section class="flex flex-col gap-8 px-4 py-12 lg:flex-row lg:items-center lg:px-16 lg:py-24">
  <div class="text-center lg:text-left lg:flex-1">
    <h1 class="text-3xl font-bold md:text-4xl lg:text-5xl">Headline</h1>
    <p class="mt-4 text-gray-600 md:text-lg">Supporting copy</p>
    <Button class="mt-6">CTA</Button>
  </div>

  <div class="w-full max-w-sm mx-auto lg:flex-1 lg:max-w-none">
    <img src="/hero.png" class="w-full" alt="Hero" />
  </div>
</section>
```

### Card grid

```html
<!-- 1 col mobile → 2 col tablet → 3 col desktop -->
<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <Card item={item} />)}
</div>
```

### Scalable typography

```html
<h1 class="text-2xl font-bold md:text-4xl lg:text-5xl">
  Title that scales
</h1>
<p class="text-sm text-gray-600 md:text-base lg:text-lg">
  Body text
</p>
```

### Container with max-width

```html
<!-- Without max-width: content stretches edge-to-edge on wide screens -->
<!-- With max-width: comfortable reading width centered on screen -->
<section class="px-4 py-12 md:px-8 lg:py-24">
  <div class="max-w-4xl mx-auto">
    Content here
  </div>
</section>
```

---

## What is the viewport meta tag?

Without it, mobile devices render the page at desktop width (typically 980px) and then scale it down — everything becomes tiny and unreadable:

```html
<!-- Required in <head> of every page -->
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

This tells the browser to use the device's actual width as the viewport width.

---

## How do you audit your own responsive design?

**Chrome DevTools responsive mode:** `Cmd + Shift + M` (Mac) / `Ctrl + Shift + M` (Windows)

**Viewports to test at:**

```
375px  → smallest common phone (iPhone SE)
430px  → iPhone 15 Pro Max
768px  → iPad portrait
1024px → iPad landscape / small laptop
1440px → standard desktop
```

**Checklist per viewport:**

```
375px:
□ No horizontal scroll
□ Text readable without zooming
□ Buttons have enough tap area (min 44px height)
□ Images don't clip or overflow
□ Nav shows hamburger menu

768px:
□ Layout shifts from 1 column to 2
□ Hamburger transitions to full nav

1024px+:
□ Content doesn't stretch too wide (max-width on containers)
□ Text line length is comfortable (not more than ~80 chars)
□ Sufficient whitespace
```

---

## Common Interview Questions

**Q: What is mobile-first and why does it matter?**
**A:** A CSS strategy where base styles target the smallest viewport and `min-width` media queries add complexity for larger screens. It matters because most web traffic is mobile, and progressive enhancement (adding capabilities) produces simpler, more maintainable code than graceful degradation (removing them).

**Q: What's the difference between `max-width` and `min-width` in media queries?**
**A:** `max-width` applies the style up to that width — desktop-first. `min-width` applies from that width upward — mobile-first. Tailwind uses `min-width` exclusively for all breakpoint prefixes.

**Q: Why is Tailwind inherently mobile-first?**
**A:** Because unprefixed classes apply to all screen sizes, and breakpoint prefixes (`md:`, `lg:`) are `min-width` — they add styles to larger screens but never remove styles from smaller ones.

**Q: What is a touch target and what's the minimum size?**
**A:** The tappable area on a touchscreen. WCAG 2.5.5 recommends a minimum of 44×44px so it's comfortable to activate with a fingertip. Buttons that are too small cause accidental taps and accessibility failures.

---

## Common Mistakes

**1. Missing the viewport meta tag** — the single most impactful mistake. Mobile browsers render at desktop width without it.

**2. Fixed `px` font sizes** — prevent users from adjusting text size in their browser.
```css
/* ❌ */  font-size: 16px;
/* ✅ */  font-size: 1rem;  /* respects browser base size */
```

**3. Images without width constraints** — an `<img>` without `width` or `max-width` can exceed the viewport.
```html
<!-- ❌ -->  <img src="hero.png" />
<!-- ✅ -->  <img src="hero.png" class="w-full max-w-full" />
```

**4. Touch targets smaller than 44px** — text links and tiny icon buttons fail on mobile.
```html
<!-- ❌ -->  <button class="py-1 px-2 text-xs">Save</button>
<!-- ✅ -->  <button class="py-3 px-4 min-h-[44px]">Save</button>
```

**5. No `max-width` on desktop** — content stretches to the full browser width, creating uncomfortably long line lengths on large monitors.

---

## Cheat Sheet

```html
<!-- ── Required head tag ───────────────────────────────── -->
<meta name="viewport" content="width=device-width, initial-scale=1" />

<!-- ── Tailwind breakpoints (min-width) ───────────────── -->
<!-- sm: 640px | md: 768px | lg: 1024px | xl: 1280px -->
<div class="text-sm md:text-base lg:text-lg">
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
<div class="flex flex-col md:flex-row">
<div class="px-4 md:px-8 lg:px-16">

<!-- ── Container pattern ──────────────────────────────── -->
<section class="px-4 py-12 md:py-20">
  <div class="max-w-5xl mx-auto">content</div>
</section>

<!-- ── Show / hide ────────────────────────────────────── -->
<div class="block md:hidden">mobile only</div>
<div class="hidden md:block">desktop only</div>
<div class="hidden md:flex">desktop flex</div>

<!-- ── Images ─────────────────────────────────────────── -->
<img class="w-full max-w-full object-cover" />
<img class="w-full aspect-video object-cover" />

<!-- ── Touch target ───────────────────────────────────── -->
<button class="min-h-[44px] px-4 py-3">Tap me</button>

<!-- ── Typography scale ───────────────────────────────── -->
<h1 class="text-2xl font-bold md:text-4xl lg:text-5xl">
<p class="text-sm md:text-base text-gray-600">
```
