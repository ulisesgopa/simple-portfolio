---
author: Ulises Gómez
publishDate: 2026-07-08T10:00:00Z
title: "Next.js Reference: App Router, Server Components & Rendering Strategies"
tags:
    - Next.js
    - React
    - TypeScript
    - Frontend
description: Quick reference for Next.js App Router. Server vs Client Components, rendering strategies (static, dynamic, ISR), data fetching and caching, Server Actions, and route conventions. Interview Q&A included.
cover:
  src: './images/covers/nextjs-app-router.webp'
  alt: 'Next.js App Router and Server Components'
---

## Quick Reference

- App Router components are **Server Components by default**, zero JS shipped to the client unless you opt in with `'use client'`
- `'use client'` marks a **boundary**, not a single component, everything it imports becomes client code too
- Server Components can be `async` and fetch data directly, no `useEffect`, no loading state juggling
- Rendering is **per route**: static (default), dynamic (on request), or ISR (static + revalidation)
- `fetch` in Server Components is extended with caching options: `{ cache: 'force-cache' }`, `{ next: { revalidate: 60 } }`, `{ cache: 'no-store' }`. Since Next.js 15, `fetch` is **not cached by default**, you opt in
- Server Actions (`'use server'`) let forms mutate data without writing API routes

---

## App Router vs Pages Router: what changed?

| | Pages Router (`pages/`) | App Router (`app/`) |
|---|---|---|
| Default rendering | Client Components | **Server Components** |
| Data fetching | `getServerSideProps` / `getStaticProps` | `async` components + extended `fetch` |
| Layouts | `_app.tsx` (one global) | Nested `layout.tsx` per segment |
| Loading / error UI | Manual | `loading.tsx` / `error.tsx` conventions |
| Mutations | API routes | Server Actions + API routes |

The App Router is the recommended approach for new projects. The mental model shift: **the server is the default, the client is the exception.**

---

## Server Components vs Client Components

```tsx
// app/events/page.tsx: Server Component (default, no directive)
// Runs ONLY on the server. Can access DB, secrets, filesystem.
// Ships ZERO JavaScript to the browser.
export default async function EventsPage() {
  const events = await getEvents()  // direct async fetch, no useEffect
  return (
    <section>
      {events.map(event => <EventCard key={event.id} event={event} />)}
      <RegisterButton eventId={events[0].id} />  {/* client island */}
    </section>
  )
}
```

```tsx
// components/RegisterButton.tsx: Client Component
'use client'

import { useState } from 'react'

export function RegisterButton({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false)
  // hooks, event handlers, browser APIs: all need 'use client'
  return <button onClick={() => register(eventId)} disabled={loading}>Register</button>
}
```

**When a component must be a Client Component:**
- Uses hooks (`useState`, `useEffect`, `useRef`…)
- Has event handlers (`onClick`, `onChange`…)
- Uses browser APIs (`window`, `localStorage`, `IntersectionObserver`)
- Uses context consumers or libraries that depend on them (Zustand works in both, but subscriptions are client-side)

**The composition rule:** keep `'use client'` as low in the tree as possible. A page can be 90% server-rendered with small interactive islands, the same philosophy as Astro islands, built into the framework.

---

## What are the rendering strategies?

Next.js decides **per route** at build time:

```
Static (default)     → HTML generated at build, served from CDN
Dynamic              → HTML generated per request (uses await cookies(), await headers(), searchParams)
ISR                  → static + regenerated in background after a revalidate window
Client-side          → 'use client' + fetch in the browser (for user-specific widgets)
```

```tsx
// Static: event landing pages, generated at build
// In Next.js 15+, params is a Promise: you must await it
export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  return <EventLanding event={event} />
}

// generateStaticParams = App Router version of getStaticPaths
export async function generateStaticParams() {
  const events = await getEvents()
  return events.map(e => ({ slug: e.slug }))
}

// ISR: revalidate the page every 5 minutes
export const revalidate = 300

// Dynamic: force per-request rendering (admin dashboards)
export const dynamic = 'force-dynamic'
```

**Decision rule:** public content → static or ISR. Anything behind auth (admin dashboards, ticket validation queues) → dynamic.

---

## How does data fetching and caching work?

`fetch` in Server Components is extended with cache controls. **Next.js 15 changed the default:** a plain `fetch(url)` is no longer cached (Next.js 14 cached by default), and GET Route Handlers aren't cached either. Caching is opt-in:

```tsx
// Cached indefinitely (static data): opt in explicitly
const res = await fetch(url, { cache: 'force-cache' })

// Revalidated every 60 seconds (ISR per-request)
const res = await fetch(url, { next: { revalidate: 60 } })

// Never cached (always fresh: dashboards, auth data)
const res = await fetch(url, { cache: 'no-store' })

// Tag-based invalidation
const res = await fetch(url, { next: { tags: ['events'] } })

// later, in a Server Action (Next.js 16):
updateTag('events')             // expires the tag immediately: the next render reads fresh data
// or, from a Server Action / Route Handler such as a payment webhook:
revalidateTag('events', 'max')  // stale-while-revalidate; the 2nd argument (cache profile) is required in Next.js 16
```

Tags only invalidate data that was **cached with that tag** (`fetch` with `next.tags`, or `'use cache'` + `cacheTag`). If a page reads straight from a database, use `revalidatePath('/route')` instead. Next.js 16 also adds Cache Components (`'use cache'`) as an opt-in caching model, the options above remain valid in the default model.

**Request deduplication:** identical `fetch` calls in the same render pass are automatically deduped, a layout and a page can both request the same data without a double hit.

---

## What are the route file conventions?

```
app/
├── layout.tsx        → shared UI wrapping all children (persists across navigation)
├── page.tsx          → the route's UI (makes the segment publicly accessible)
├── loading.tsx       → instant loading state (automatic Suspense boundary)
├── error.tsx         → error boundary for the segment (must be 'use client')
├── not-found.tsx     → 404 UI
├── eventos/
│   ├── [slug]/
│   │   ├── page.tsx        → /eventos/mi-evento
│   │   └── registro/
│   │       └── page.tsx    → /eventos/mi-evento/registro
├── (admin)/          → route group: organizes without affecting the URL
│   ├── layout.tsx    → auth check + sidebar for every admin page
│   └── dashboard/page.tsx  → /dashboard
└── api/
    └── webhooks/route.ts   → API endpoint (GET/POST handlers)
```

**Nested layouts** are the killer feature: an admin section defines its auth guard and sidebar once in `(admin)/layout.tsx`, and every page inside inherits it without re-rendering the layout on navigation.

---

## What are Server Actions?

Functions that run on the server, callable directly from forms or client components, no API route boilerplate:

```tsx
// app/actions/tickets.ts
'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'  // your own session/role check

export async function approveTicket(formData: FormData) {
  // Server Actions are public HTTP endpoints: always authorize INSIDE the action,
  // hiding the button in the UI is not access control
  await requireAdmin()

  const ticketId = String(formData.get('ticketId'))
  await db.ticket.update({
    where: { id: ticketId },
    data: { status: 'APPROVED' },
  })
  revalidatePath('/admin/tickets')  // this list reads from the DB, so invalidate by path
}
```

```tsx
// In a Server Component: works without any client JS
<form action={approveTicket}>
  <input type="hidden" name="ticketId" value={ticket.id} />
  <button type="submit">Approve</button>
</form>
```

For pending/error states in the client, `useActionState` (React 19) wraps the action with form state.

**When to still use API routes (`route.ts`):** webhooks from external services (payment providers), endpoints consumed by other clients (mobile apps), anything that isn't a user-triggered mutation from your own UI.

---

## How does hydration work, and what causes hydration errors?

The server sends HTML; React then attaches event listeners and state on the client ("hydration"). The rendered output of both passes must match.

```tsx
// ❌ Hydration mismatch: server and client render different text
function Clock() {
  return <span>{new Date().toLocaleTimeString()}</span>
}
```

```tsx
// ✅ Render after mount, when only the client is involved
'use client'

import { useState, useEffect } from 'react'

function Clock() {
  const [time, setTime] = useState<string | null>(null)
  useEffect(() => { setTime(new Date().toLocaleTimeString()) }, [])
  return <span>{time ?? '...'}</span>
}
```

Common causes: `Date.now()` / `Math.random()` in render, reading `localStorage` during render, browser extensions injecting DOM, invalid HTML nesting (`<p>` inside `<p>`).

---

## Image and font optimization

```tsx
import Image from 'next/image'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

// next/image: automatic webp/avif, lazy loading, no layout shift
<Image src={event.coverUrl} alt={event.name} width={1200} height={630} preload />
```

- `preload` on above-the-fold images (hero, LCP element) disables lazy loading and preloads them. It replaces `priority`, which is deprecated in Next.js 16 (use `priority` on 15 and earlier)
- `next/font` self-hosts fonts at build time, no external request to Google, no FOUT

---

## Common Interview Questions

**Q: What is a React Server Component and how is it different from SSR?**
**A:** SSR renders HTML on the server but still ships the full component JS for hydration. Server Components never ship their JS to the client, the code runs only on the server and sends a serialized result. SSR is *where the first render happens*; Server Components are *where the code lives*. App Router uses both together.

**Q: Can a Server Component use useState?**
**A:** No. Server Components render once on the server, there's no state, no effects, no event handlers. Interactivity requires a Client Component (`'use client'`). The pattern is to push state to the leaves and keep data fetching at the top in Server Components.

**Q: What does `'use client'` actually do?**
**A:** It marks the boundary where the client bundle starts. That module and everything it imports get bundled and shipped to the browser. It does NOT mean "renders only on the client", Client Components still render to HTML on the server first, then hydrate.

**Q: How do you decide between static, ISR, and dynamic rendering?**
**A:** By how fresh the data must be and whether the output depends on the request. Marketing/event pages → static. Content that updates on a schedule → ISR with `revalidate`. Anything reading cookies, headers, or user sessions → dynamic. Using `cookies()` or `headers()` automatically opts the route into dynamic.

**Q: What's the difference between a Server Action and an API route?**
**A:** A Server Action is an RPC-style function tied to your UI, called from a form or client component, type-safe end to end, no manual fetch or JSON parsing. An API route is a public HTTP endpoint, needed for webhooks and external consumers. Use Actions for your own mutations, routes for everything external.

---

## Common Mistakes

**1. Putting `'use client'` at the top of every file**: turns the app back into a client-heavy SPA and loses the Server Component benefits. Keep the boundary low.

**2. Fetching in `useEffect` when a Server Component could do it**: extra round trip, loading spinners, and client JS for data that was available at render time on the server.

**3. Passing non-serializable props across the boundary**: functions (except Server Actions) and class instances can't cross from Server to Client Components. Pass plain data; React 19 also serializes `Date`, `Map`, `Set`, and Promises, but plain objects and strings are the safest default.

**4. Using `cache: 'no-store'` everywhere "to be safe"**: disables the entire caching layer and makes every page dynamic. Choose per data source.

**5. Reading `params` or `searchParams` and expecting a static page**: `searchParams` makes the route dynamic. If you need static, move the variation into the path segment and `generateStaticParams`.

---

## Cheat Sheet

```tsx
// ── Server Component (default) ─────────────────────────
export default async function Page() {
  const data = await getData()          // direct async fetch
  return <List data={data} />
}
// Next.js 15+: params, searchParams, cookies(), headers() are async → await them

// ── Client Component ───────────────────────────────────
'use client'
export function Widget() { const [s, setS] = useState() ... }

// ── Route config (per route/segment) ───────────────────
export const revalidate = 300              // ISR: seconds
export const dynamic = 'force-dynamic'     // always per-request
export async function generateStaticParams() { return [...] }

// ── fetch caching ──────────────────────────────────────
fetch(url, { cache: 'force-cache' })        // static
fetch(url, { next: { revalidate: 60 } })    // ISR
fetch(url, { cache: 'no-store' })           // always fresh
fetch(url, { next: { tags: ['events'] } })  // tag for invalidation

// ── Invalidation ───────────────────────────────────────
updateTag('events')              // Server Actions only (Next.js 16): read-your-own-writes
revalidateTag('events', 'max')   // Actions / Route Handlers (Next.js 16: 2nd arg required)
revalidatePath('/eventos')       // for data read straight from a DB

// ── Server Action ──────────────────────────────────────
'use server'
export async function action(formData: FormData) { ... }
// <form action={action}> ... </form>

// ── File conventions ───────────────────────────────────
layout.tsx    // persistent shared UI
page.tsx      // route UI
loading.tsx   // Suspense fallback
error.tsx     // error boundary ('use client')
route.ts      // API endpoint
[slug]        // dynamic segment
(group)       // route group, no URL effect

// ── Navigation ─────────────────────────────────────────
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { redirect, notFound } from 'next/navigation'  // server-side
```
