---
author: Ulises Gómez
publishDate: 2025-06-01T10:00:00Z
title: Mobile First — How I Think About Responsive Design
tags:
    - CSS
    - Tailwind CSS
    - Responsive Design
    - Mobile First
description: The mobile-first principle applied to real projects — what it actually means in practice, how it's applied with Tailwind, the most common mistakes, and how to audit your own design.
cover:
  src: './images/customizing-user-information/cover.webp'
  alt: 'Mobile First Responsive Design'
---

## What "Mobile First" Actually Means

Mobile first is not "make it work on mobile too". It's a **CSS strategy**: you write the base styles for the smallest viewport and then use media queries to add styles as the viewport grows.

The difference is fundamental:

```css
/* ❌ Desktop first — design for desktop then "fix" mobile */
.card {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr; /* desktop */
}

@media (max-width: 768px) {
  .card {
    grid-template-columns: 1fr; /* override for mobile */
  }
}

/* ✅ Mobile first — design for mobile then enhance for desktop */
.card {
  display: grid;
  grid-template-columns: 1fr; /* mobile base */
}

@media (min-width: 768px) {
  .card {
    grid-template-columns: 1fr 1fr 1fr; /* enhancement for desktop */
  }
}
```

The direction of the override matters: desktop-first creates "fix" code, mobile-first creates "enhancement" code.

---

## Tailwind Implements Mobile-First by Design

Every Tailwind class without a prefix applies to **all sizes**. Breakpoint prefixes are `min-width` — they apply from that size upward:

```
no prefix → 0px and up (mobile base)
sm:        → 640px and up
md:        → 768px and up
lg:        → 1024px and up
xl:        → 1280px and up
2xl:       → 1536px and up
```

```html
<!-- Mobile: vertical stack, centered text, full-width button -->
<!-- Tablet (md+): 2 columns, left-aligned text -->
<!-- Desktop (lg+): 3 columns -->

<div class="flex flex-col text-center md:flex-row md:text-left">
  <button class="w-full md:w-auto">
    Contact
  </button>
</div>
```

---

## The Process I Follow on Every Project

### 1. Always Start at 375px

Before writing a single line of CSS, I set the browser viewport to 375px (iPhone SE — the smallest in common use). Every design decision starts from there.

### 2. Define the Mobile Layout First

```html
<!-- Octopay landing — features section -->
<!-- Mobile: 1 column, stacked cards -->
<!-- Desktop: 3-column grid -->

<section class="px-4 py-12 md:px-8 lg:px-16">
  <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    <FeatureCard />
    <FeatureCard />
    <FeatureCard />
  </div>
</section>
```

### 3. Scalable Typography

```html
<!-- Headings that scale with the viewport -->
<h1 class="text-2xl font-bold md:text-4xl lg:text-5xl">
  Connect your business to the future
</h1>

<p class="text-sm text-gray-600 md:text-base lg:text-lg">
  Description that scales too
</p>
```

### 4. Proportional Spacing

```html
<!-- More padding on large screens, less on mobile -->
<section class="py-8 px-4 md:py-16 md:px-8 lg:py-24 lg:px-16">
```

---

## Real Patterns from My Projects

### Responsive Navbar — Octopay Landing

```html
<!-- Mobile: logo + hamburger button -->
<!-- Desktop: logo + horizontal links + CTA -->

<nav class="flex items-center justify-between px-4 py-3 md:px-8">
  <Logo />

  <!-- Hamburger — visible only on mobile -->
  <button class="block md:hidden" onClick={toggleMenu}>
    <MenuIcon />
  </button>

  <!-- Links — hidden on mobile, visible on desktop -->
  <div class="hidden md:flex items-center gap-6">
    <NavLinks />
    <Button>Get Started</Button>
  </div>
</nav>

<!-- Mobile menu — dropdown -->
<div class={`block md:hidden ${isOpen ? 'block' : 'hidden'}`}>
  <MobileMenu />
</div>
```

### Projects Grid — This Portfolio

```html
<!-- 1 column on mobile, 2 on tablet, stays 2 on desktop by design -->
<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
  {projects.map(project => <ProjectCard project={project} />)}
</div>
```

### Hero Section with Image — PeludoTag

```html
<!-- Mobile: image on top, text below (stack) -->
<!-- Desktop: image on the right, text on the left (split) -->

<section class="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
  <div class="text-center lg:text-left lg:w-1/2">
    <h1>Find your lost pet</h1>
    <p>QR code system for pets</p>
    <Button>Register a pet</Button>
  </div>

  <div class="w-full max-w-sm lg:w-1/2 lg:max-w-none">
    <img src="/hero-pet.png" alt="Pet with QR code" />
  </div>
</section>
```

---

## Common Mistakes I Made and Fixed

### 1. Forgetting the Viewport Meta Tag

Without this, mobile will never render correctly:

```html
<!-- In the <head> — mandatory -->
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

### 2. Using Fixed `px` for Font Sizes

```css
/* ❌ Doesn't scale with user preferences */
font-size: 16px;

/* ✅ Relative to the browser's base size */
font-size: 1rem;  /* = 16px by default, but respects user changes */
```

### 3. Elements Breaking Out of the Viewport on Mobile

```html
<!-- ❌ An image without a width constraint can break the layout -->
<img src="hero.png" />

<!-- ✅ Always constrain images -->
<img src="hero.png" class="w-full max-w-full" />
```

### 4. Touch Targets That Are Too Small

Buttons on mobile need at least 44px height so a finger can tap them comfortably:

```html
<!-- ❌ Too small for mobile -->
<button class="py-1 px-2 text-xs">Send</button>

<!-- ✅ Appropriate touch target -->
<button class="py-3 px-4 min-h-[44px]">Send</button>
```

---

## How to Audit Your Own Responsive Design

**1. Chrome DevTools — Device Toolbar**
- `Cmd + Shift + M` (Mac) or `Ctrl + Shift + M` (Windows)
- Test at: 375px, 428px, 768px, 1024px, 1440px

**2. Checklist per viewport:**

```
375px (small mobile):
□ Is there horizontal scroll? (there shouldn't be)
□ Is the text readable without zooming?
□ Are the buttons tappable?
□ Are images not clipped?

768px (tablet):
□ Does the layout shift from 1 column to 2?
□ Does the navbar switch from hamburger to links?

1024px+ (desktop):
□ Is the content not stretching too wide?
□ Is there a max-width on containers?
```

**3. Max-width on containers — frequent desktop mistake**

```html
<!-- ❌ Text stretches to full screen width on desktop -->
<section class="px-8">
  <p>Very long text that's hard to read on wide monitors...</p>
</section>

<!-- ✅ Centered container with a maximum width -->
<section class="px-4 md:px-8">
  <div class="max-w-4xl mx-auto">
    <p>Text with a readable line length on any screen</p>
  </div>
</section>
```

---

## What I Should Be Able to Explain in Interviews

1. **What is mobile first and why does it matter?** — A strategy where base styles target the smallest viewport and `min-width` media queries scale up to desktop. It matters because most web traffic is mobile, and progressive enhancement (adding) produces better code than graceful degradation (removing).

2. **The difference between `max-width` and `min-width` in media queries?** — `max-width` applies the style up to that width (desktop first). `min-width` applies the style from that width upward (mobile first). Tailwind uses `min-width` exclusively.

3. **Why is Tailwind inherently mobile first?** — Because unprefixed classes apply to all sizes and breakpoints (`md:`, `lg:`) are `min-width` — they only add styles to larger screens, never remove them from smaller ones.

4. **What is a touch target and what's the minimum size?** — The area of the screen that responds to touch. Accessibility guidelines (WCAG) recommend a minimum of 44x44px so it's comfortable to tap with a finger.

---

## Resources to Go Deeper

- [MDN: Responsive design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Tailwind: Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [WCAG: Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
