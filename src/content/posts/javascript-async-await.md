---
author: Ulises Gómez
publishDate: 2025-02-10T10:00:00Z
title: JavaScript Async/Await — What I Learned Building Real APIs
tags:
    - JavaScript
    - Async/Await
    - Fetch API
    - Promises
description: How asynchronous code works in JavaScript, why it exists, and the real patterns I use across my projects with Supabase, Resend, and native fetch.
cover:
  src: './images/customizing-theme-color-schemes/cover.webp'
  alt: 'JavaScript Async Await'
---

## Why JavaScript Needs Asynchronous Code

JavaScript runs on a single thread. That means if an operation blocks that thread — calling an API, reading from a database, waiting on a timer — the entire UI freezes.

The solution is the **asynchronous model**: instead of blocking while waiting, JavaScript delegates the operation and keeps executing. When the operation completes, it resumes from where it left off.

---

## Callbacks → Promises → Async/Await

This is the evolution that solved the problem:

### Callbacks (the problem)

```javascript
fetchUser(id, function(error, user) {
  if (error) {
    handleError(error)
  } else {
    fetchPosts(user.id, function(error, posts) {
      if (error) {
        handleError(error)
      } else {
        // callback hell — every nesting level is a level of pain
        render(posts)
      }
    })
  }
})
```

### Promises (better, but verbose)

```javascript
fetchUser(id)
  .then(user => fetchPosts(user.id))
  .then(posts => render(posts))
  .catch(error => handleError(error))
```

### Async/Await (what I use today)

```javascript
async function loadUserPosts(id) {
  try {
    const user = await fetchUser(id)
    const posts = await fetchPosts(user.id)
    render(posts)
  } catch (error) {
    handleError(error)
  }
}
```

`async/await` is syntactic sugar over Promises. Under the hood they are exactly the same — only the syntax changes.

---

## Fetch API — the base pattern

`fetch()` is the browser's native function for making HTTP requests. It returns a Promise.

```javascript
// Basic GET
async function getProducts() {
  const response = await fetch('https://api.example.com/products')

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`)
  }

  const data = await response.json()
  return data
}
```

**Two `await` calls worth understanding:**
1. `await fetch(url)` — waits for the HTTP response to arrive (the headers)
2. `await response.json()` — waits for the full body to be parsed

These are two separate operations. If you forget the second `await`, you get an unresolved Promise, not the data.

---

## The Pattern I Use Across My Projects

In **POS Colombia**, every backend API call follows this pattern:

```typescript
// Typed with TypeScript so we know exactly what to expect
interface Product {
  id: string
  name: string
  price: number
  categoryId: string
}

async function fetchProducts(token: string): Promise<Product[]> {
  const response = await fetch('/api/products', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    // Don't assume all errors look the same
    const errorData = await response.json()
    throw new Error(errorData.error.message)
  }

  return response.json()
}
```

---

## POST with a Body — Creating a Resource

```typescript
async function createSale(saleData: CreateSaleDto, token: string) {
  const response = await fetch('/api/sales', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(saleData), // data goes serialized in the body
  })

  if (!response.ok) {
    throw new Error('Error creating sale')
  }

  return response.json()
}
```

---

## Supabase — fetch with abstraction

In **PeludoTag**, I use Supabase which handles fetch internally:

```typescript
import { supabase } from '@/lib/supabase'

async function getPetById(petId: string) {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', petId)
    .single()

  if (error) throw error
  return data
}
```

Supabase uses the same async/await model but abstracts authentication headers, JSON parsing, and error handling into the `{ data, error }` object.

---

## Error Handling: What Tutorials Skip

A common mistake is using try/catch without knowing what to do with the error:

```javascript
// ❌ Empty catch — the error disappears silently
try {
  const data = await fetchData()
} catch (e) {}

// ❌ console.log and carry on as if nothing happened
try {
  const data = await fetchData()
} catch (e) {
  console.log(e)
}
```

What I do in my projects:

```typescript
// ✅ Handle the error in a way the user can see
async function loadPet(id: string) {
  try {
    const pet = await getPetById(id)
    setPet(pet)
  } catch (error) {
    // Notify the user (PeludoTag uses sonner for toasts)
    toast.error('Could not load the pet profile')
    // And report in production (Sentry in PeludoTag)
    Sentry.captureException(error)
  } finally {
    setLoading(false) // this always runs, error or not
  }
}
```

---

## Parallel Calls with Promise.all

If I need multiple pieces of data that don't depend on each other, I don't fetch them one at a time:

```typescript
// ❌ Sequential — 300ms + 300ms = 600ms of waiting
const user = await fetchUser(id)
const products = await fetchProducts()

// ✅ Parallel — both run at the same time, ~300ms total
const [user, products] = await Promise.all([
  fetchUser(id),
  fetchProducts(),
])
```

`Promise.all` fails if any of the promises fail. If I need tolerance to individual failures, I use `Promise.allSettled`.

---

## What I Should Be Able to Explain in Interviews

1. **What is a Promise?** — An object representing a future value. It can be in `pending`, `fulfilled`, or `rejected` state.

2. **Does `async` without `await` make sense?** — Yes. An `async` function always returns a Promise even if it has no `await` inside.

3. **What happens if you forget `await`?** — The function continues without waiting. `const data = fetchData()` gives you a Promise, not the data.

4. **When would you use `Promise.all` vs `Promise.allSettled`?** — `.all` when all results are required (if one fails, the rest don't matter). `.allSettled` when I need partial results even if some fail.

---

## Resources to Go Deeper

- MDN: [Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
- MDN: [async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- MDN: [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
