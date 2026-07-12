---
author: Ulises Gómez
publishDate: 2026-06-17T10:00:00Z
title: "Astro Reference: Islands Architecture, Content Collections & Hydration"
tags:
    - Astro
    - JavaScript
    - Performance
    - Frontend
description: Quick reference for Astro. Islands architecture, client directives, Content Collections with Zod, View Transitions, and when to choose Astro over Next.js. Interview Q&A included.
cover:
  src: './images/covers/astro-islands-architecture.webp'
  alt: 'Astro Islands Architecture'
---

## Quick Reference

- Astro generates **pure HTML by default**, zero JavaScript sent to the browser unless you explicitly opt in
- An "island" is an interactive component that hydrates on the client, isolated from surrounding static content
- `.astro` files run **only on the server** at build time, no access to `window`, `localStorage`, or browser APIs
- `.tsx`/`.jsx` components become islands when given a `client:*` directive
- Content Collections validate `.md`/`.mdx` frontmatter with **Zod at build time**, build fails on schema errors
- View Transitions are native browser API exposed as a component, no React Router, no extra JS bundle

---

## What problem does Astro solve?

Modern JS frameworks (React, Vue) ship the entire runtime to every user, even for pages that are mostly static content. For a portfolio or blog, the browser downloads and executes hundreds of kilobytes of JavaScript to render content that could have been plain HTML.

```
React SPA flow:
1. Download mostly-empty HTML
2. Download JS bundle (~200–500KB)
3. Parse + execute JS
4. Make API calls
5. Render content  ← user sees something here

Astro flow:
1. Download complete HTML  ← user sees content immediately
2. (optionally) Download small JS for interactive islands
```

---

## What is the Islands Architecture?

Most of the page is static HTML. Only the components that need interactivity are "islands" that hydrate with JavaScript on the client.

```
Page structure:
├── Header (static HTML, 0 JS)
├── Hero section (static HTML, 0 JS)
├── TabsButtons (⬛ React island, JS loads with client:idle)
├── ProjectCards (static HTML, 0 JS)
└── Footer (static HTML, 0 JS)
```

Each island is independent. Their JavaScript loads and executes in isolation.

---

## What are the client directives?

```astro
<!-- No directive, server-rendered only, zero JS to client -->
<Navbar />

<!-- client:load, hydrate immediately on page load -->
<CriticalWidget client:load />

<!-- client:idle, hydrate when browser main thread is free -->
<TabsButtons client:idle />

<!-- client:visible, hydrate when component enters viewport -->
<HeavyChart client:visible />

<!-- client:only="react", skip server render, client only -->
<BrowserOnlyMap client:only="react" />
```

**Choosing the right directive:**
- `client:load`: interactive from the first moment (auth buttons, nav)
- `client:idle`: non-critical interactive (tabs, tooltips)
- `client:visible`: below the fold (charts, comment sections)
- `client:only`: requires browser APIs not available on server (maps, canvas)

---

## How do Astro and React coexist?

```astro
---
// .astro files run at build time (server/Node)
// Cannot use window, localStorage, or browser events here
import ProjectCard from './ProjectCard.astro'
import TabsButtons from './TabsButtons.tsx'  // React component

const projects = await getCollection('projects')  // build-time data fetch
---

<section>
  {/* Astro loop → pure HTML */}
  {projects.map(project => <ProjectCard project={project} />)}

  {/* React island → loads JS, hydrates on client */}
  <TabsButtons client:idle />
</section>
```

The separation is explicit and enforced: Astro components are always server-side. React components become islands only when you add a `client:*` directive.

---

## What are Content Collections?

A built-in system for managing local content files (`.md`, `.mdx`) with full type safety:

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    startDate: z.date(),
    endDate: z.date(),
    summary: z.string(),
    url: z.string(),
    cover: image(),       // Astro optimizes this automatically
    tags: z.array(z.string()),
  }),
})

export const collections = { projects }
```

At build time, Astro:
1. Reads every `.mdx` file in `src/content/projects/`
2. Validates each against the Zod schema
3. **Fails the build** with a clear error if a field is missing or has the wrong type
4. Generates TypeScript types for use in components
5. Optimizes all referenced images

```astro
---
// src/pages/projects/[id].astro
import { getCollection, render } from 'astro:content'

export async function getStaticPaths() {
  const projects = await getCollection('projects')
  return projects.map(project => ({
    params: { id: project.id },
    props: { project },
  }))
}

const { project } = Astro.props
const { Content } = await render(project)
---

<Layout title={project.data.title}>
  <Content />
</Layout>
```

---

## How do View Transitions work?

The browser's View Transitions API interpolates visually between the HTML of one page and the next. Astro exposes it as a single component:

```astro
---
// src/layouts/Layout.astro
import { ClientRouter } from 'astro:transitions'
---
<head>
  <ClientRouter />
</head>
```

No React Router, no SPA routing state, no additional JavaScript bundle. It's a native browser feature.

---

## Performance comparison

| Metric | React SPA | Astro |
|--------|-----------|-------|
| JS sent to client | ~200–500KB | ~5–20KB |
| Time to First Byte | Server dependent | Instant (static) |
| First Contentful Paint | 1–3 seconds | < 0.5 seconds |

---

## When NOT to use Astro?

Astro excels for content-heavy sites. It's not the right tool for:

- **Complex global state**, dashboards with real-time updates, optimistic UI, complex filters
- **Auth-heavy apps**, Next.js has a better ecosystem (NextAuth, Clerk, middleware)
- **Apps where most pages are interactive**, if 80%+ of the app needs React, the island model adds overhead without benefit

**Decision rule:** content/marketing/portfolio/blog → Astro. Auth-gated dashboards, SPAs → Next.js.

---

## Common Interview Questions

**Q: What is the islands architecture?**
**A:** A rendering pattern where most of the page is static HTML (no JavaScript) and only components that need interactivity are "islands" hydrated with JavaScript on the client. It minimizes the JavaScript a user downloads and dramatically improves FCP.

**Q: Why Astro over Next.js for a portfolio?**
**A:** The portfolio is mostly static content. Astro generates pure HTML with zero JS overhead by default. Next.js would send the React runtime to every user even though most pages don't need client-side JavaScript. Right tool for the right job.

**Q: What does `client:idle` do vs `client:load`?**
**A:** `client:load` hydrates the component as soon as the page HTML loads, may compete with other critical resources. `client:idle` waits until the browser has finished its initial work and has free time on the main thread, better for non-critical interactive components.

**Q: How does Astro validate Content Collections?**
**A:** Using Zod schemas defined in `src/content/config.ts`. The build fails with a clear field-level error if any content file doesn't match the schema. This is build-time validation, errors surface before deployment, not in production.

---

## Common Mistakes

**1. Using browser APIs in `.astro` files**: `.astro` runs at build time (Node environment). `window`, `document`, `localStorage` are not available. Move browser-specific logic to a `client:only` island.

**2. Missing the Zod schema**: without a schema, Content Collections are untyped. Add the schema and type-check your MDX frontmatter.

**3. Using `client:load` for everything**: hydrates all islands immediately, defeats the point. Use `client:idle` or `client:visible` for non-critical components.

**4. Putting async data fetching in client components**: Astro server components can fetch data at build time. Only use client-side fetching when data must be dynamic at request time.

---

## Cheat Sheet

```astro
---
// Astro component (server/build time)
import { getCollection, render } from 'astro:content'
import MyReactComponent from './Component.tsx'

const items = await getCollection('posts')
const { title, description } = Astro.props
---

<!-- Static HTML (0 JS) -->
{items.map(item => <div>{item.data.title}</div>)}

<!-- React island, pick one directive -->
<MyReactComponent client:load />     <!-- immediately -->
<MyReactComponent client:idle />     <!-- when browser is free -->
<MyReactComponent client:visible />  <!-- when in viewport -->
<MyReactComponent client:only="react" /> <!-- browser only -->
```

```typescript
// Content Collection schema (src/content/config.ts)
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    publishDate: z.date(),
    tags: z.array(z.string()),
    description: z.string(),
    cover: z.object({ src: z.string(), alt: z.string() }),
  }),
})
```

```astro
---
// View Transitions (src/layouts/Layout.astro)
import { ClientRouter } from 'astro:transitions'
---
<head>
  <ClientRouter />
</head>
```
