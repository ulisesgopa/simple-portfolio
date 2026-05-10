---
author: Ulises Gómez
publishDate: 2025-03-01T10:00:00Z
title: "React Hooks Reference — useState, useEffect & Beyond"
tags:
    - React
    - Hooks
    - JavaScript
    - Frontend
description: Quick reference for the most important React hooks. useState, useEffect, useRef, useMemo, useCallback, and custom hooks with interview Q&A and a cheat sheet.
cover:
  src: './images/customizing-user-information/cover.webp'
  alt: 'React Hooks useState useEffect'
---

## Quick Reference

- Hooks only work in **function components** and at the **top level** — no inside loops, conditions, or nested functions
- `useState` returns `[value, setter]` — the setter does **not** mutate, it schedules a re-render with a new value
- `useEffect` runs **after** the render — empty array `[]` = once on mount, no array = every render
- The cleanup function inside `useEffect` runs before the component unmounts **and** before the effect runs again
- `useRef` gives you a mutable `.current` that does **not** cause a re-render when changed
- `useMemo` memoizes a **value**, `useCallback` memoizes a **function** — both take a dependency array

---

## What problem did hooks solve?

Before React 16.8, sharing stateful logic between components required class components, HOCs, or render props — all verbose and hard to compose. Hooks let function components use state, side effects, and lifecycle behavior without any of that.

```javascript
// Before hooks: class with manual binding
class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = { count: 0 }
    this.increment = this.increment.bind(this)
  }
  increment() { this.setState({ count: this.state.count + 1 }) }
  render() { return <button onClick={this.increment}>{this.state.count}</button> }
}

// After hooks: function component
function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

---

## How does useState work?

`useState(initialValue)` returns `[currentValue, setter]`. Calling the setter schedules a re-render; the component re-runs and gets the new value.

```typescript
const [count, setCount] = useState(0)
const [user, setUser] = useState<User | null>(null)
const [form, setForm] = useState({ name: '', email: '' })
```

**Use the functional form when the next value depends on the current one:**

```javascript
// ❌ May read stale value on rapid updates
setCount(count + 1)

// ✅ Always reads the most recent value
setCount(prev => prev + 1)
```

**Updating object state requires spreading — setter replaces, not merges:**

```javascript
// ❌ Loses all other fields
setForm({ name: 'Ulises' })

// ✅ Spread first, then override
setForm(prev => ({ ...prev, name: 'Ulises' }))
```

**Lazy initializer — runs only once on mount:**

```javascript
// expensiveCalc() called on every render (ignored after first)
const [state] = useState(expensiveCalc())

// ✅ Function form: expensiveCalc() called only once
const [state] = useState(() => expensiveCalc())
```

---

## How does useEffect work?

`useEffect` runs code after the component renders. It's used for fetching data, subscriptions, timers, and syncing with external systems.

```javascript
useEffect(() => {
  // runs after render

  return () => {
    // cleanup: runs before unmount AND before next effect execution
  }
}, [dependencies])
```

**Dependency array behavior:**

| Array | When it runs |
|-------|-------------|
| `[]` | Once on mount (equivalent to `componentDidMount`) |
| `[id]` | On mount and every time `id` changes |
| *(omitted)* | After every render — almost never what you want |

**Pattern — fetching data with cancellation:**

```typescript
useEffect(() => {
  let cancelled = false

  async function load() {
    try {
      const data = await getPetById(petId)
      if (!cancelled) setPet(data)
    } catch {
      if (!cancelled) setError('Not found')
    } finally {
      if (!cancelled) setLoading(false)
    }
  }

  load()
  return () => { cancelled = true }
}, [petId])
```

---

## What is useRef for?

Two distinct uses:

1. **DOM access** — get a direct reference to a DOM element
2. **Mutable value** — store a value that changes but should **not** trigger a re-render

```javascript
// DOM access
const inputRef = useRef<HTMLInputElement>(null)
useEffect(() => { inputRef.current?.focus() }, [])
return <input ref={inputRef} />

// Mutable value (timer ID, previous value, etc.)
const timerId = useRef<ReturnType<typeof setTimeout> | null>(null)
// timerId.current changes don't cause re-renders
```

---

## When should you use useMemo and useCallback?

Both exist to avoid re-computing or re-creating things on every render. Use them when the cost of recomputation is measurable or when referential equality matters for a child component.

```javascript
// useMemo — memoizes a computed value
const total = useMemo(
  () => cartItems.reduce((sum, item) => sum + item.subtotal, 0),
  [cartItems]
)

// useCallback — memoizes a function reference
const handleSubmit = useCallback(async (data: FormData) => {
  await createSale(data)
  clearCart()
}, [clearCart])
```

**When NOT to memoize:** trivial computations, primitive values, functions that don't get passed to children. The overhead of memoization itself can cost more than recomputing.

---

## How do you extract a custom hook?

When stateful logic is used in multiple components, extract it into a function starting with `use`:

```typescript
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(url)
      .then(r => r.json())
      .then(d => { if (!cancelled) setData(d) })
      .catch(() => { if (!cancelled) setError('Fetch failed') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [url])

  return { data, loading, error }
}

// Usage
const { data: pet, loading } = useFetch<Pet>(`/api/pets/${id}`)
```

---

## Common Interview Questions

**Q: What happens if you put an object or array directly in the dependency array?**
**A:** They're compared by reference. `{}` is never equal to `{}`, so the effect runs on every render. Fix by wrapping with `useMemo` or flattening to primitives in the array.

**Q: What's the difference between `useState(value)` and `useState(() => value)`?**
**A:** The function form (lazy initializer) only runs on the first render. The value form evaluates on every render but the result is discarded after the first. Use the function form for expensive initial computations like reading from `localStorage`.

**Q: What is the useEffect cleanup function?**
**A:** The function returned from inside the effect. It runs before the component unmounts and before the effect re-runs due to a dependency change. Used to cancel subscriptions, clear timers, and abort fetch requests.

**Q: Can you call hooks conditionally?**
**A:** No. React tracks hooks by their call order. If a hook is inside an `if` block, the order can differ between renders and React's internal state gets corrupted. Move the condition inside the hook instead.

---

## Common Mistakes

**1. Mutating state directly** — React won't detect the change and won't re-render.
```javascript
// ❌
user.name = 'Ulises'
// ✅
setUser(prev => ({ ...prev, name: 'Ulises' }))
```

**2. Infinite loop in useEffect** — setting state that's in the dependency array creates a loop.
```javascript
// ❌ data changes → effect runs → data changes → ...
useEffect(() => { setData([...data, item]) }, [data])
// ✅ use functional update or restructure
```

**3. Missing cleanup on subscriptions** — listeners survive component unmount, causing memory leaks.
```javascript
// ❌
useEffect(() => { window.addEventListener('resize', handler) }, [])
// ✅
useEffect(() => {
  window.addEventListener('resize', handler)
  return () => window.removeEventListener('resize', handler)
}, [])
```

**4. Unnecessary useEffect for derived values** — compute them directly during render.
```javascript
// ❌
useEffect(() => { setFullName(`${first} ${last}`) }, [first, last])
// ✅
const fullName = `${first} ${last}`
```

---

## Cheat Sheet

```javascript
// ── useState ──────────────────────────────────────────
const [value, setValue] = useState(initial)
const [state, setState] = useState<Type>(() => expensiveInit())
setValue(newValue)                        // replace
setValue(prev => prev + 1)               // functional update
setState(prev => ({ ...prev, key: v }))  // object update

// ── useEffect ─────────────────────────────────────────
useEffect(() => { /* on mount */ }, [])
useEffect(() => { /* on dep change */ }, [dep])
useEffect(() => { /* every render */ })
useEffect(() => { return () => { /* cleanup */ } }, [dep])

// ── useRef ────────────────────────────────────────────
const ref = useRef<HTMLInputElement>(null)
ref.current?.focus()
const mutable = useRef(0)
mutable.current = 42  // no re-render

// ── useMemo & useCallback ─────────────────────────────
const value = useMemo(() => expensive(dep), [dep])
const fn = useCallback(() => doSomething(dep), [dep])

// ── Custom hook pattern ───────────────────────────────
function useMyHook(param) {
  const [state, setState] = useState(null)
  useEffect(() => { /* logic */ }, [param])
  return state
}
```
