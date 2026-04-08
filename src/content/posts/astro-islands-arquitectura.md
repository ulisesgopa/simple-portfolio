---
author: Ulises Gómez
publishDate: 2025-07-15T10:00:00Z
title: Astro Islands — Why This Portfolio Loads So Fast
tags:
    - Astro
    - JavaScript
    - Performance
    - Frontend
description: What the islands architecture in Astro is, how partial hydration works, and why this technical decision makes the portfolio faster than one built with Next.js or plain Vite.
cover:
  src: './images/customizing-theme-color-schemes/cover.webp'
  alt: 'Astro Islands Architecture'
---

## The Problem Astro Solves

The web was built on static HTML. Then JavaScript arrived and Single Page Applications (SPAs) took over: React, Vue, Angular. The result was sites that felt fast to develop but were heavy for users — the browser downloads and executes megabytes of JavaScript to render content that could have arrived as HTML.

**The real cost:** In a React SPA, the browser needs to:
1. Download the HTML (empty or nearly empty)
2. Download the JavaScript bundle (~100KB to several MB)
3. Parse and execute the JavaScript
4. Make API calls
5. Render the content

Only at step 5 does the user see something useful.

---

## The Solution: Static Rendering + Interactive Islands

Astro generates **pure HTML** by default. There is no JavaScript in the output unless you explicitly ask for it.

An "island" is an interactive component that hydrates on the client — isolated from the surrounding static page.

```
Full page
├── Header (static HTML — no JS)
├── Hero section (static HTML — no JS)
├── TabsButtons (⬛ React Island — JS loaded with client:idle)
├── ProjectCards (static HTML — no JS)
└── Footer (static HTML — no JS)
```

Only the component that needs interactivity (`TabsButtons`) downloads JavaScript. Everything else is pure HTML.

---

## Hydration Directives in This Portfolio

Astro defines when and how to load a component's JS:

```astro
---
// src/pages/index.astro
import TabsButtons from '../components/TabsButtons.tsx'
---

<!-- No directive = server-rendered only, 0 JS sent to client -->
<Navbar />

<!-- client:idle = load JS when the main thread is free -->
<TabsButtons client:idle />

<!-- client:load = load JS as soon as the page loads -->
<CriticalComponent client:load />

<!-- client:visible = load JS when the component enters the viewport -->
<HeavyWidget client:visible />

<!-- client:only="react" = client only, never on the server -->
<BrowserOnlyChart client:only="react" />
```

### Why `client:idle` for TabsButtons?

The portfolio tabs (About / Portfolio) are not critical for the first render. If the browser is busy loading more important assets, waiting until it's free (`idle`) is the right call. The user sees all the HTML content on first render; the tabs become interactive shortly after without blocking anything.

---

## Astro and React in the Same Project — No Conflict

This portfolio uses **Astro for structure and React for interactivity**:

```astro
---
// Astro component — runs ONLY on the server (build time)
// No access to window, localStorage, or browser events
import ProjectCard from './ProjectCard.astro'
import TabsButtons from './TabsButtons.tsx'  // React component

const projects = await getCollection('projects')
---

<section>
  <!-- This runs on the server — pure HTML -->
  {projects.map(project => <ProjectCard project={project} />)}

  <!-- This hydrates on the client — real JavaScript -->
  <TabsButtons client:idle />
</section>
```

The separation is explicit: `.astro` files are always server-side, `.tsx` or `.jsx` files can be islands if given a `client:*` directive.

---

## Content Collections — A CMS Without a Server

This portfolio uses no external CMS (Contentful, Sanity, etc.). Content lives in `.md` and `.mdx` files with type validation via Zod:

```typescript
// src/content/config.ts
const projects = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/projects" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    startDate: z.date(),
    endDate: z.date(),
    summary: z.string(),
    url: z.string(),
    cover: image(),       // Astro optimizes the image automatically
    tags: z.array(z.string()),
  }),
})
```

At build time, Astro:
1. Reads all `.mdx` files from `src/content/projects/`
2. Validates each file against the Zod schema
3. If a field is mistyped or missing → **the build fails with a clear error**
4. Generates TypeScript types for use in components
5. Optimizes the referenced images

```astro
---
// src/pages/projects/[id].astro
import { getCollection } from 'astro:content'

// Generates a static route for each project
export async function getStaticPaths() {
  const projects = await getCollection('projects')
  return projects.map(project => ({
    params: { id: project.id },
    props: { project },
  }))
}

const { project } = Astro.props
const { Content } = await project.render()
---

<Layout title={project.data.title}>
  <Content />  <!-- MDX rendered to HTML -->
</Layout>
```

---

## Performance in Numbers

The difference between Astro and a SPA framework for a portfolio:

| Metric | SPA React/Next.js | Astro (this portfolio) |
|--------|-------------------|----------------------|
| JavaScript sent to client | ~200–500KB | ~5–20KB |
| Time to First Byte | Depends on server | Instant (static) |
| First Contentful Paint | ~1–3 seconds | < 0.5 seconds |
| Build time | ~30–60 seconds | ~5–15 seconds |

---

## When NOT to Use Astro

Astro is excellent for static or low-interactivity content. It's not the right tool for:

- **Apps with complex global state** — a dashboard with real-time updates, complex filters, optimistic updates
- **Auth with protected routes** — though it supports SSR, Next.js has a better ecosystem for auth (NextAuth)
- **Apps that need React on almost every page** — if 80% of the app is interactive, the configuration overhead isn't worth it

For those cases, I use **Next.js**. For content, marketing sites, portfolios, and blogs: **Astro**.

---

## View Transitions — Page Animations Without Extra JavaScript

This portfolio uses Astro's View Transitions API for page-to-page transitions:

```astro
---
// src/layouts/Layout.astro
import { ClientRouter } from 'astro:transitions'
---

<head>
  <ClientRouter />
  <!-- enables native CSS transitions between pages -->
</head>
```

The browser visually interpolates between the HTML of one page and the next — no React Router, no navigation state, no additional JavaScript. It's a native browser API that Astro exposes as a component.

---

## What I Should Be Able to Explain in Interviews

1. **What is the islands architecture?** — A pattern where most of the page is static HTML (no JavaScript) and only the components that need interactivity are "hydrated" with JavaScript on the client. It dramatically reduces the JS a user downloads.

2. **Why did you choose Astro over Next.js for the portfolio?** — The portfolio is mostly static content. Astro generates pure HTML by default with zero JS overhead. Next.js would send the React runtime to every user even though most pages don't need it. The right tool for the right problem.

3. **What does `client:idle` do vs `client:load`?** — `client:load` hydrates the component as soon as the HTML loads (may block the main thread). `client:idle` waits until the browser finishes its initial work and has free time — better for non-critical components.

4. **How does Astro validate Content Collections?** — With Zod schemas defined in `src/content/config.ts`. The build fails if any content file doesn't match the schema. This is build-time validation, not runtime.

---

## Resources to Go Deeper

- [Astro Docs: Islands Architecture](https://docs.astro.build/en/concepts/islands/)
- [Astro Docs: Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro Docs: Client Directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)
- [MDN: View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
