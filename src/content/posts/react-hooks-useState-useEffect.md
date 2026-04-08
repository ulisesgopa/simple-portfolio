---
author: Ulises Gómez
publishDate: 2025-03-01T10:00:00Z
title: React Hooks — useState and useEffect From the Inside
tags:
    - React
    - Hooks
    - JavaScript
    - Frontend
description: How the two most important React hooks work, the most common mistakes, and the patterns I use in real projects like PeludoTag and the Habit Tracker App.
cover:
  src: './images/customizing-user-information/cover.webp'
  alt: 'React Hooks useState useEffect'
---

## What Problem Do Hooks Solve?

Before hooks (React < 16.8), having state in a component required a **class component**:

```javascript
class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = { count: 0 }
    this.increment = this.increment.bind(this) // manual binding
  }

  increment() {
    this.setState({ count: this.state.count + 1 })
  }

  render() {
    return <button onClick={this.increment}>{this.state.count}</button>
  }
}
```

Hooks achieve the same result in a function component — no classes, no binding, no `this`:

```javascript
function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

---

## useState — Local Component State

`useState` returns an array with two elements: the current value and a function to update it.

```typescript
const [value, setValue] = useState<Type>(initialValue)
//       ↑         ↑                   ↑
//    state      setter          initial value
```

### Rules That Matter

**1. The setter doesn't mutate — it replaces**

```javascript
// ❌ Mutating directly — React won't detect the change
const [user, setUser] = useState({ name: 'Ulises', age: 27 })
user.name = 'Other' // does not re-render

// ✅ Creating a new object
setUser({ ...user, name: 'Other' })
```

**2. Updates are asynchronous**

```javascript
const [count, setCount] = useState(0)

function handleClick() {
  setCount(count + 1)
  console.log(count) // logs the PREVIOUS value, not the new one
}
```

**3. When the next state depends on the current one, use the functional form**

```javascript
// ❌ Can have bugs on rapid successive updates
setCount(count + 1)

// ✅ Always uses the most recent value
setCount(prevCount => prevCount + 1)
```

### Real Pattern — Controlled Form

In **PeludoTag**, the pet registration form uses this pattern:

```typescript
interface PetForm {
  name: string
  breed: string
  age: number
  notes: string
}

function RegisterPet() {
  const [form, setForm] = useState<PetForm>({
    name: '',
    breed: '',
    age: 0,
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value })) // spread + computed property
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await registerPet(form)
    } catch (err) {
      setError('Error registering pet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={form.name} onChange={handleChange} />
      <input name="breed" value={form.breed} onChange={handleChange} />
      {error && <p>{error}</p>}
      <button disabled={loading}>
        {loading ? 'Registering...' : 'Register pet'}
      </button>
    </form>
  )
}
```

---

## useEffect — Side Effects

`useEffect` runs code **after the component renders**. It's used for:
- API calls
- Subscriptions (WebSockets, events)
- Syncing with localStorage
- Timers

```javascript
useEffect(() => {
  // code that runs after render

  return () => {
    // cleanup — runs when the component unmounts
    // or before the effect runs again due to a dependency change
  }
}, [dependencies]) // dependency array
```

### The Dependency Array — The Part That Confuses Everyone

```javascript
useEffect(() => {
  fetchData()
}, [])
// [] empty = runs ONCE on mount
// Equivalent to componentDidMount in classes

useEffect(() => {
  fetchData(id)
}, [id])
// Runs every time `id` changes

useEffect(() => {
  fetchData()
})
// No array = runs on EVERY render (rarely what you want)
```

### Real Pattern — Loading Data on Mount

In **PeludoTag**, the public pet profile page loads data like this:

```typescript
function PetProfile({ petId }: { petId: string }) {
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false // prevent state updates if the component unmounted

    async function loadPet() {
      try {
        const data = await getPetById(petId)
        if (!cancelled) setPet(data)
      } catch {
        if (!cancelled) setError('Pet not found')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadPet()

    return () => {
      cancelled = true // cleanup — prevents memory leaks
    }
  }, [petId]) // re-loads if the ID changes

  if (loading) return <Spinner />
  if (error) return <ErrorMessage message={error} />
  if (!pet) return null

  return <PetCard pet={pet} />
}
```

### Real Pattern — Syncing with localStorage

In the **Habit Tracker**, theme and accessibility preferences persist across sessions:

```typescript
function useThemePreference() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Initializer function — only runs once on mount
    const saved = localStorage.getItem('theme')
    return (saved as 'light' | 'dark') ?? 'light'
  })

  useEffect(() => {
    localStorage.setItem('theme', theme) // syncs whenever it changes
  }, [theme])

  return [theme, setTheme] as const
}
```

---

## The Most Common Mistakes

### 1. Missing Dependencies

```javascript
// ❌ ESLint will warn you about this
useEffect(() => {
  fetchProducts(categoryId) // categoryId is used but not in deps
}, [])

// ✅
useEffect(() => {
  fetchProducts(categoryId)
}, [categoryId])
```

### 2. Infinite Loop

```javascript
// ❌ every render updates `data`, which causes another render, infinite loop
const [data, setData] = useState([])

useEffect(() => {
  setData([...data, newItem]) // data changes → effect runs → data changes → ...
}, [data])
```

### 3. Forgetting Cleanup on Subscriptions

```javascript
// ❌ if the component unmounts, the listener stays active
useEffect(() => {
  window.addEventListener('resize', handleResize)
}, [])

// ✅ return the cleanup function
useEffect(() => {
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])
```

---

## When NOT to Use useEffect

React 18+ and the official docs discourage using `useEffect` for:

- **Transforming data for render** — do it directly in the render
- **Handling user events** — use event handlers
- **Client-side data fetching** — prefer a library like React Query (what we use in POS Colombia with TanStack Query)

```javascript
// ❌ useEffect to transform data
useEffect(() => {
  setFullName(`${firstName} ${lastName}`)
}, [firstName, lastName])

// ✅ calculate it directly
const fullName = `${firstName} ${lastName}`
```

---

## What I Should Be Able to Explain in Interviews

1. **What happens if you put an object or array in useEffect's dependency array?** — It's compared by reference, not by value. A new object `{}` is always different from another `{}`, causing loops. Solution: `useMemo` or restructure the state.

2. **The difference between `useState` with a value vs a function?** — `useState(() => expensiveCalc())` evaluates the function only once on mount. `useState(expensiveCalc())` evaluates it on every render even though the result is ignored.

3. **What is the useEffect cleanup?** — The function returned inside the effect. It runs before the component unmounts and before the effect runs again due to a dependency change.

4. **What is `useRef` for?** — References to DOM elements and storing values that should NOT cause a re-render when they change (like a timer ID or the previous value of something).

---

## Resources to Go Deeper

- [React Docs: useState](https://react.dev/reference/react/useState)
- [React Docs: useEffect](https://react.dev/reference/react/useEffect)
- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
