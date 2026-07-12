---
author: Ulises Gómez
publishDate: 2026-02-05T10:00:00Z
title: "JavaScript Async Reference: Event Loop, Promises & async/await"
tags:
    - JavaScript
    - Async/Await
    - Fetch API
    - Promises
description: Quick reference for asynchronous JavaScript. Event loop, Promise states, async/await patterns, Promise combinators, sequential vs parallel execution. With interview Q&A and a cheat sheet.
cover:
  src: './images/covers/javascript-async-await.webp'
  alt: 'JavaScript Async Await'
---

## Quick Reference

- JavaScript is **single-threaded**, async operations don't run in parallel inside JS, they delegate to the browser/runtime and get a callback when done
- `async` functions always return a **Promise**, even without `await` inside
- `await` pauses the **current async function** only, other code keeps running
- Forgetting `await` gives you an unresolved Promise, not the value
- `Promise.all` fails fast if any promise rejects. `Promise.allSettled` waits for all and never throws
- Microtasks (Promises) run **before** macrotasks (setTimeout, setInterval) in the event loop

---

## How does the Event Loop work?

JavaScript has one call stack. When an async operation completes, its callback is queued and processed when the stack is empty.

```
Call Stack        Microtask Queue    Macrotask Queue
─────────────     ───────────────    ───────────────
main()            Promise.then()     setTimeout()
fetchData()       async/await        setInterval()
                  queueMicrotask()   I/O events
```

**Execution order:** synchronous code → microtasks → macrotasks.

```javascript
console.log('1')               // sync

setTimeout(() => {
  console.log('4')             // macrotask
}, 0)

Promise.resolve().then(() => {
  console.log('3')             // microtask
})

console.log('2')               // sync

// Output: 1, 2, 3, 4
```

This is a classic interview question. `setTimeout(..., 0)` does not mean "immediate", it means "after all microtasks."

---

## Callbacks → Promises → async/await

The same operation expressed in each style:

```javascript
// Callbacks: nested, hard to reason about
fetchUser(id, (err, user) => {
  if (err) return handleError(err)
  fetchPosts(user.id, (err, posts) => {
    if (err) return handleError(err)
    render(posts)  // callback hell
  })
})

// Promises: flat chain, better
fetchUser(id)
  .then(user => fetchPosts(user.id))
  .then(posts => render(posts))
  .catch(handleError)

// async/await: reads like synchronous code
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

`async/await` is syntactic sugar over Promises. They compile to the same thing.

---

## What are the three Promise states?

| State | Meaning | Transitions to |
|-------|---------|----------------|
| `pending` | Initial state, operation in progress | `fulfilled` or `rejected` |
| `fulfilled` | Operation completed successfully | terminal |
| `rejected` | Operation failed | terminal |

Once a Promise settles (fulfilled or rejected), it never changes state again.

```javascript
// Creating a Promise manually
const promise = new Promise((resolve, reject) => {
  if (success) resolve(value)   // → fulfilled
  else reject(new Error('...')) // → rejected
})

// Consuming
promise
  .then(value => { /* fulfilled */ })
  .catch(error => { /* rejected */ })
  .finally(() => { /* always */ })
```

---

## What does an async function actually return?

Every `async` function wraps its return value in a Promise:

```javascript
async function greet() {
  return 'hello'  // actually returns Promise.resolve('hello')
}

// Equivalent to:
function greet() {
  return Promise.resolve('hello')
}

// You must await or .then() to get the value
const message = await greet()  // 'hello'
```

---

## Sequential vs Parallel execution

```javascript
// Sequential: 300ms + 300ms = 600ms
const user = await fetchUser(id)
const products = await fetchProducts()

// Parallel: both run simultaneously, ~300ms total
const [user, products] = await Promise.all([
  fetchUser(id),
  fetchProducts(),
])
```

**Only use sequential `await` when the second call depends on the result of the first.**

---

## What are the Promise combinators?

| Method | Resolves when | Rejects when | Use case |
|--------|--------------|-------------|----------|
| `Promise.all` | All fulfill | Any rejects | Need all results |
| `Promise.allSettled` | All settle (any state) | Never | Need all results, tolerating failures |
| `Promise.race` | First settles | First rejects | Timeout pattern |
| `Promise.any` | First fulfills | All reject | Try multiple sources, use fastest |

```javascript
// allSettled: for dashboard data where partial failure is OK
const results = await Promise.allSettled([
  fetchSales(),
  fetchInventory(),
  fetchCustomers(),
])
results.forEach(r => {
  if (r.status === 'fulfilled') use(r.value)
  if (r.status === 'rejected') logError(r.reason)
})

// race: timeout pattern
const data = await Promise.race([
  fetch('/api/data'),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), 5000)
  ),
])
```

---

## How do you handle errors properly?

```javascript
// ❌ Silent catch: error disappears
try {
  const data = await fetchData()
} catch (e) {}

// ❌ Log and continue: state may be inconsistent
try {
  const data = await fetchData()
} catch (e) { console.log(e) }

// ✅ Handle visibly, report, clean up
async function loadPet(id: string) {
  try {
    const pet = await getPetById(id)
    setPet(pet)
  } catch (error) {
    toast.error('Could not load the pet profile')
    Sentry.captureException(error)
  } finally {
    setLoading(false)  // always runs, error or not
  }
}
```

---

## Common Interview Questions

**Q: What is the output of this code?**
```javascript
async function main() {
  console.log('A')
  await Promise.resolve()
  console.log('B')
}
console.log('C')
main()
console.log('D')
```
**A:** `C`, `A`, `D`, `B`. Synchronous code runs first (C, then A, then D). The `await` suspends `main` and resumes it as a microtask after the current sync code finishes (B last).

**Q: Does `async` without `await` make sense?**
**A:** Yes. An `async` function always returns a Promise, even with no `await` inside. Useful for consistent return types across a module.

**Q: What happens if you forget `await`?**
**A:** The code continues without waiting. `const data = fetchData()` gives you a `Promise<Data>`, not `Data`. TypeScript will usually catch this if the types are correct.

**Q: `Promise.all` vs `Promise.allSettled`: when to use each?**
**A:** Use `.all` when all results are required and a single failure should abort everything. Use `.allSettled` when you want all results even if some fail, like loading multiple dashboard widgets independently.

---

## Common Mistakes

**1. `async` inside `forEach`**: `forEach` doesn't await callbacks. Use `for...of` or `Promise.all` instead.
```javascript
// ❌ These don't wait for each other
items.forEach(async (item) => { await processItem(item) })

// ✅ Sequential
for (const item of items) { await processItem(item) }

// ✅ Parallel
await Promise.all(items.map(item => processItem(item)))
```

**2. Nested try/catch in Promise chains**: pick one style, don't mix.

**3. Creating a Promise unnecessarily**: if a function already returns a Promise, don't wrap it.
```javascript
// ❌
return new Promise((resolve) => { resolve(fetch(url)) })
// ✅
return fetch(url)
```

**4. Unhandled rejection**: always attach a `.catch()` or use try/catch with `await`.

---

## Cheat Sheet

```javascript
// ── Create a Promise ───────────────────────────────────
new Promise((resolve, reject) => { ... })
Promise.resolve(value)
Promise.reject(new Error('...'))

// ── Consume ────────────────────────────────────────────
promise.then(v => ...).catch(e => ...).finally(() => ...)
const v = await promise  // inside async function

// ── async function ─────────────────────────────────────
async function fn() { return value }           // returns Promise<value>
const fn = async () => { ... }
const result = await fn()

// ── Error handling ─────────────────────────────────────
try {
  const data = await fetch(url).then(r => r.json())
} catch (error) {
  // handle
} finally {
  // always
}

// ── Parallel ───────────────────────────────────────────
const [a, b] = await Promise.all([fetchA(), fetchB()])
const results = await Promise.allSettled([fetchA(), fetchB()])

// ── Combinators ────────────────────────────────────────
Promise.all(promises)          // all or fail
Promise.allSettled(promises)   // all, never throws
Promise.race(promises)         // first to settle
Promise.any(promises)          // first to fulfill

// ── forEach gotcha ────────────────────────────────────
for (const x of items) { await process(x) }              // sequential
await Promise.all(items.map(x => process(x)))            // parallel
```
