---
author: Ulises Gómez
publishDate: 2025-05-10T10:00:00Z
title: "Zustand Reference — Global State, Selectors & Persistence"
tags:
    - React
    - Zustand
    - State Management
    - Frontend
description: Quick reference for Zustand. When to use it, how create() works, selectors for performance, persist middleware, and how it compares to Context API and TanStack Query. Interview Q&A included.
cover:
  src: './images/customizing-theme-color-schemes/cover.webp'
  alt: 'Global State with Zustand'
---

## Quick Reference

- Zustand is for **local app state** — cart contents, UI state, session data — not server state
- **No Provider, no boilerplate** — `create()` returns a hook you call directly in any component
- `set()` merges by default — no need to spread the entire state manually
- Use **selectors** `useStore(s => s.value)` to avoid re-renders when unrelated parts of the store change
- The `persist` middleware serializes state to `localStorage` automatically
- **Zustand ≠ TanStack Query**: Zustand is for client state, TanStack Query is for server state

---

## When do you need global state?

You don't always need it. The decision tree:

```
Is the state local to one component?  → useState
Does it need to go 1-2 levels up?     → lift state + props
Is it server data (API responses)?    → TanStack Query / SWR
Is it shared across distant components, changes frequently,
or has complex update logic?          → Zustand
Rarely changes (theme, language, user)? → Context API works fine
```

---

## How does Zustand work?

`create()` takes a function that receives `set` and `get`, and returns an object with the initial state and the actions:

```typescript
import { create } from 'zustand'

interface CounterState {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}))

// In any component — no Provider needed
function Counter() {
  const { count, increment } = useCounterStore()
  return <button onClick={increment}>{count}</button>
}
```

`set()` merges the returned object with the current state. You only need to include the keys you want to change.

---

## What does a real store look like?

POS session + cart store with typed actions:

```typescript
interface POSStore {
  cashSession: CashSession | null
  cartItems: CartItem[]
  selectedCustomer: Customer | null

  openSession: (session: CashSession) => void
  closeSession: () => void
  addToCart: (product: Product, qty: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
}

const usePOSStore = create<POSStore>((set, get) => ({
  cashSession: null,
  cartItems: [],
  selectedCustomer: null,

  openSession: (session) => set({ cashSession: session }),

  closeSession: () => set({ cashSession: null, cartItems: [], selectedCustomer: null }),

  addToCart: (product, qty) =>
    set((state) => {
      const existing = state.cartItems.find(i => i.productId === product.id)
      if (existing) {
        return {
          cartItems: state.cartItems.map(i =>
            i.productId === product.id
              ? { ...i, quantity: i.quantity + qty }
              : i
          ),
        }
      }
      return {
        cartItems: [...state.cartItems, {
          productId: product.id,
          name: product.name,
          unitPrice: product.price,
          quantity: qty,
          subtotal: product.price * qty,
        }],
      }
    }),

  removeFromCart: (productId) =>
    set((state) => ({
      cartItems: state.cartItems.filter(i => i.productId !== productId),
    })),

  clearCart: () => set({ cartItems: [], selectedCustomer: null }),
}))
```

---

## What are selectors and why do they matter?

By default, `useStore()` subscribes to the **entire store**. Any change in any field triggers a re-render in every component that calls it.

```typescript
// ❌ Re-renders when ANY part of the store changes
const store = usePOSStore()
const cartItems = store.cartItems

// ✅ Only re-renders when cartItems changes
const cartItems = usePOSStore((state) => state.cartItems)

// ✅ Multiple values — useShallow prevents unnecessary re-renders
import { useShallow } from 'zustand/react/shallow'

const { cartItems, selectedCustomer } = usePOSStore(
  useShallow((state) => ({
    cartItems: state.cartItems,
    selectedCustomer: state.selectedCustomer,
  }))
)
```

Selectors are especially important in components that render frequently (POS cart, live product lists).

---

## How does the persist middleware work?

Automatically serializes state to `localStorage` on every update and rehydrates on mount:

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PreferencesStore {
  theme: 'light' | 'dark'
  lowStimMode: boolean
  setTheme: (t: 'light' | 'dark') => void
  toggleLowStim: () => void
}

const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      theme: 'light',
      lowStimMode: false,
      setTheme: (theme) => set({ theme }),
      toggleLowStim: () => set((s) => ({ lowStimMode: !s.lowStimMode })),
    }),
    {
      name: 'user-preferences',  // localStorage key
      // Optional: only persist a subset of the state
      partialize: (state) => ({ theme: state.theme }),
    }
  )
)
```

---

## Zustand vs Context API — when to use each?

```
Context API works well for:
• State that rarely changes (theme, current user, language)
• State scoped to a component subtree
• No complex update logic

Zustand is better for:
• State that changes frequently (cart, UI state, POS session)
• Complex update logic (add/remove/update items)
• State accessed across distant parts of the tree
• When re-render performance matters
```

Context API re-renders **all consumers** whenever any part of the context value changes. Zustand with selectors re-renders only the components that subscribed to the specific value that changed.

---

## Zustand vs TanStack Query — they solve different problems

```typescript
// TanStack Query — for data that lives on the server
const { data: products, isLoading } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
  staleTime: 5 * 60 * 1000,  // cache 5 minutes
})

// Zustand — for data that lives in the client
const { cartItems, addToCart } = usePOSStore()
```

TanStack Query handles caching, background refetch, loading states, and server synchronization. Zustand handles none of that — it's pure in-memory local state. In POS Colombia, both are used together because they solve different things.

---

## Common Interview Questions

**Q: When would you use Zustand instead of useState?**
**A:** When state needs to be shared between components that don't have a direct parent-child relationship, or when the update logic (like POS cart operations) is complex enough to benefit from being centralized and tested in isolation.

**Q: How do you avoid unnecessary re-renders in Zustand?**
**A:** Use selectors: `useStore(state => state.specificValue)` instead of `useStore()`. The component only re-renders when exactly that selected value changes. For multiple values, use `useShallow` to compare by shallow equality.

**Q: What's the difference between Zustand and Context API?**
**A:** Context API re-renders all consumers when any part of the context value changes. Zustand uses selectors for granular subscriptions. For frequently-changing state like a shopping cart, Zustand is significantly more efficient.

**Q: What does the `persist` middleware do?**
**A:** Serializes the store state to `localStorage` on every update and rehydrates it on mount. It's the equivalent of manually calling `localStorage.setItem` in every action and `localStorage.getItem` on initialization — but automatic and typed.

---

## Common Mistakes

**1. Using Zustand for server state** — use TanStack Query instead. Zustand doesn't handle cache invalidation, background refetch, or stale data.

**2. Subscribing to the whole store** — `const store = useStore()` re-renders the component on every state change. Always use a selector.

**3. Storing derived values in the store** — compute them from the store state instead.
```typescript
// ❌ Keep cartTotal in store
// ✅ Derive it:
const total = usePOSStore(state => state.cartItems.reduce((s, i) => s + i.subtotal, 0))
```

**4. Not using `set` with a function for updates that depend on current state** — can read stale values.
```typescript
// ❌ count might be stale
set({ count: count + 1 })
// ✅
set(state => ({ count: state.count + 1 }))
```

---

## Cheat Sheet

```typescript
// ── Create store ──────────────────────────────────────
const useStore = create<State>((set, get) => ({
  value: initial,
  action: () => set({ value: newValue }),
  actionWithPrev: () => set(state => ({ value: state.value + 1 })),
  readInAction: () => { const v = get().value; set({ ... }) },
}))

// ── Use in component ───────────────────────────────────
const value = useStore(state => state.value)               // selector
const action = useStore(state => state.action)             // action
const { a, b } = useStore(useShallow(s => ({ a: s.a, b: s.b })))

// ── Persist middleware ─────────────────────────────────
create<State>()(persist(
  (set) => ({ ... }),
  {
    name: 'storage-key',
    partialize: (state) => ({ only: state.only }),  // partial persist
  }
))

// ── set() forms ────────────────────────────────────────
set({ key: value })                    // merge
set(state => ({ key: state.key + 1 })) // function form (safe)
set({ key: value }, true)             // replace entire state (replace flag)

// ── get() — read state inside actions ─────────────────
const value = get().someField
```
