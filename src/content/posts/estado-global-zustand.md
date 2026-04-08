---
author: Ulises Gómez
publishDate: 2025-05-10T10:00:00Z
title: Global State with Zustand — Why I Chose It Over Redux
tags:
    - React
    - Zustand
    - State Management
    - Frontend
description: How Zustand works, how it differs from Redux and Context API, and the real patterns I use in POS Colombia and the Habit Tracker App for managing global state.
cover:
  src: './images/customizing-theme-color-schemes/cover.webp'
  alt: 'Global State with Zustand'
---

## The Global State Problem

In React, local state (`useState`) lives inside a component. When that state needs to be shared between components that aren't directly related in the tree, you have three options:

1. **Prop drilling** — passing the data through all intermediate components (becomes unmanageable)
2. **Context API** — native to React, but causes re-renders in all consumers whenever any part of the state changes
3. **A global state library** — Zustand, Redux, Jotai, Recoil

---

## Why Zustand Instead of Redux

Redux was the standard for years. The problem is the boilerplate:

```javascript
// Redux — for a simple counter you need:
// 1. Action types
const INCREMENT = 'INCREMENT'

// 2. Action creators
const increment = () => ({ type: INCREMENT })

// 3. Reducer
function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case INCREMENT:
      return { count: state.count + 1 }
    default:
      return state
  }
}

// 4. Store
const store = createStore(counterReducer)

// 5. Provider in the tree
// 6. useSelector + useDispatch in every component
```

**Zustand — the same result:**

```javascript
import { create } from 'zustand'

const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))

// In the component:
const { count, increment } = useCounterStore()
```

No actions, no reducers, no Provider, no boilerplate.

---

## How Zustand Works

`create()` takes a function that receives `set` and `get`, and returns the initial state plus actions:

```typescript
import { create } from 'zustand'

interface CounterState {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

const useCounterStore = create<CounterState>((set) => ({
  // Initial state
  count: 0,

  // Actions — functions that call set()
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}))
```

`set()` accepts:
- A partial object that merges with current state: `set({ count: 0 })`
- A function that receives the previous state: `set(state => ({ count: state.count + 1 }))`

---

## The POS Colombia Store

In the POS Colombia dashboard, global state manages the cash register session and the active sale cart:

```typescript
interface POSStore {
  // Cash session state
  cashSession: CashSession | null
  currentCashier: User | null

  // Active sale cart
  cartItems: CartItem[]
  selectedCustomer: Customer | null

  // Session actions
  openSession: (session: CashSession, cashier: User) => void
  closeSession: () => void

  // Cart actions
  addToCart: (product: Product, quantity: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setCustomer: (customer: Customer | null) => void
}

const usePOSStore = create<POSStore>((set, get) => ({
  cashSession: null,
  currentCashier: null,
  cartItems: [],
  selectedCustomer: null,

  openSession: (session, cashier) =>
    set({ cashSession: session, currentCashier: cashier }),

  closeSession: () =>
    set({ cashSession: null, currentCashier: null, cartItems: [] }),

  addToCart: (product, quantity) =>
    set((state) => {
      const existing = state.cartItems.find(i => i.productId === product.id)

      if (existing) {
        // Already in cart — update quantity
        return {
          cartItems: state.cartItems.map(i =>
            i.productId === product.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          )
        }
      }

      // Not in cart — add new item
      return {
        cartItems: [...state.cartItems, {
          productId: product.id,
          name: product.name,
          unitPrice: product.price,
          quantity,
          subtotal: product.price * quantity,
        }]
      }
    }),

  removeFromCart: (productId) =>
    set((state) => ({
      cartItems: state.cartItems.filter(i => i.productId !== productId)
    })),

  clearCart: () => set({ cartItems: [], selectedCustomer: null }),

  setCustomer: (customer) => set({ selectedCustomer: customer }),
}))
```

---

## Zustand with Persistence — localStorage

In the **Habit Tracker**, accessibility preferences and theme persist across sessions:

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PreferencesStore {
  theme: 'light' | 'dark'
  lowStimMode: boolean
  dyslexiaFont: boolean
  highContrast: boolean
  setTheme: (theme: 'light' | 'dark') => void
  toggleLowStim: () => void
  toggleDyslexiaFont: () => void
}

const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      theme: 'light',
      lowStimMode: false,
      dyslexiaFont: false,
      highContrast: false,

      setTheme: (theme) => set({ theme }),
      toggleLowStim: () => set((state) => ({ lowStimMode: !state.lowStimMode })),
      toggleDyslexiaFont: () => set((state) => ({ dyslexiaFont: !state.dyslexiaFont })),
    }),
    {
      name: 'user-preferences', // localStorage key
    }
  )
)
```

The `persist` middleware serializes the state to localStorage automatically. On page reload, it rehydrates the store with the saved values.

---

## Selectors — Only Re-render When What You Need Changes

Zustand re-renders the component only when the value you selected changes:

```typescript
// ❌ Re-renders every time ANY part of the store changes
const store = usePOSStore()
const cartItems = store.cartItems

// ✅ Only re-renders when cartItems changes
const cartItems = usePOSStore((state) => state.cartItems)

// ✅ Multiple values — shallow comparison to avoid unnecessary re-renders
import { useShallow } from 'zustand/react/shallow'

const { cartItems, selectedCustomer } = usePOSStore(
  useShallow((state) => ({
    cartItems: state.cartItems,
    selectedCustomer: state.selectedCustomer,
  }))
)
```

---

## Zustand vs Context API — When to Use Each

```
Context API is better for:
- State that rarely changes (theme, language, authenticated user)
- State needed only by a specific component subtree
- No complex update logic required

Zustand is better for:
- State that changes frequently (cart, preferences, UI state)
- State with complex update logic
- State accessed by components across different parts of the tree
- When re-render performance matters
```

---

## Zustand vs TanStack Query — They're Not the Same Thing

In POS Colombia I use **both**. They complement each other:

- **Zustand** — app-local state: active cash session, cart, UI state
- **TanStack Query** — server state: products from the backend, sale history, customers

```typescript
// TanStack Query — for data that comes from the server
const { data: products, isLoading } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
  staleTime: 5 * 60 * 1000, // cache for 5 minutes
})

// Zustand — for local app state
const { cartItems, addToCart } = usePOSStore()
```

TanStack Query handles cache, automatic refetch, loading states, and server synchronization. Zustand does none of that — it's just local in-memory state.

---

## What I Should Be Able to Explain in Interviews

1. **When would you use Zustand instead of useState?** — When the state needs to be accessed by components that don't have a direct relationship in the tree, or when the update logic is complex enough to justify centralizing it.

2. **How do you avoid unnecessary re-renders in Zustand?** — Using selectors: `useStore(state => state.specificValue)` instead of `useStore()`. The component only re-renders when exactly that value changes.

3. **What's the difference between Zustand and Context API?** — Context API re-renders all consumers every time any part of the context value changes. Zustand uses selectors for granular re-renders. For frequently changing state, Zustand is significantly more efficient.

4. **What does the `persist` middleware in Zustand do?** — Serializes the state to localStorage (or sessionStorage) automatically. On store mount, it rehydrates the state from storage. It's the equivalent of manually calling `localStorage.setItem` on every `setState` and `localStorage.getItem` on every initialization.

---

## Resources to Go Deeper

- [Zustand Documentation](https://zustand.docs.pmnd.rs/)
- [Zustand: Persist Middleware](https://zustand.docs.pmnd.rs/integrations/persisting-store-data)
- [TanStack Query Docs](https://tanstack.com/query/latest)
