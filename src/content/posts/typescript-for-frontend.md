---
author: Ulises Gómez
publishDate: 2026-03-15T10:00:00Z
title: "TypeScript Reference — Types, Generics & Utility Types"
tags:
    - TypeScript
    - JavaScript
    - Frontend
    - React
description: Quick reference for TypeScript in frontend projects. type vs interface, generics, utility types, any vs unknown vs never, type narrowing, and Zod. With interview Q&A and a cheat sheet.
cover:
  src: './images/customizing-user-information/cover.webp'
  alt: 'TypeScript for Frontend'
---

## Quick Reference

- TypeScript types exist **only at compile time** — they're erased in the browser. Zod handles **runtime** validation
- `interface` can be extended with `extends` and re-declared (declaration merging). `type` cannot be re-declared but supports unions, intersections, and conditional types
- Generics are **type parameters** — `Array<T>`, `Promise<T>`, `ApiResponse<T>` are generics you use every day
- `unknown` is the type-safe alternative to `any` — you must narrow it before using it
- `never` means a value that **can never exist** — used in exhaustive checks and impossible branches
- `z.infer<typeof schema>` extracts a TypeScript type from a Zod schema — define once, validate at runtime and compile time

---

## type vs interface — what's the real difference?

Both describe object shapes. The practical differences are:

| | `interface` | `type` |
|---|---|---|
| Extends | `extends OtherInterface` | `& OtherType` (intersection) |
| Declaration merging | Yes (same name = merged) | No |
| Unions | No | Yes (`'a' \| 'b'`) |
| Computed properties | Limited | Yes |
| Primitives, tuples, functions | No | Yes |

```typescript
// interface — for object shapes and component props
interface Product {
  id: string
  name: string
  price: number
  stock: number
}

// type — for unions, primitives, complex structures
type PaymentMethod = 'CASH' | 'TRANSFER' | 'CARD' | 'MERCADOPAGO'
type SaleSource = 'POS' | 'STORE' | 'APP'

// ApiResponse with union — only possible with type
type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: string }
```

**Practical rule:** use `interface` for objects and React props, use `type` for everything else.

---

## What are Generics?

Generics are type parameters that let you write typed code that works with multiple types without losing type safety.

```typescript
// Without generics — must repeat for every type
function getFirstProduct(items: Product[]): Product { return items[0] }
function getFirstUser(items: User[]): User { return items[0] }

// With generics — one function, TypeScript infers the type
function getFirst<T>(items: T[]): T { return items[0] }

const product = getFirst(products) // TypeScript knows: Product
const user = getFirst(users)       // TypeScript knows: User
```

**Generic with constraint — T must have a specific shape:**

```typescript
function getById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id)
}

// Works with Product, User, Customer — anything that has .id: string
```

**Generic API response pattern:**

```typescript
interface ApiResponse<T> {
  data: T
  meta: { total: number; page: number }
}

async function getProducts(): Promise<ApiResponse<Product[]>> {
  const res = await fetch('/api/products')
  return res.json()
}
```

---

## What are Utility Types?

Built-in TypeScript types that transform other types. The most used:

```typescript
interface User {
  id: string
  name: string
  email: string
  password: string
  role: 'admin' | 'cashier'
}

// Partial — all fields optional (for PATCH requests)
type UpdateUserDto = Partial<User>

// Required — all fields mandatory
type FullUser = Required<User>

// Readonly — immutable
type ReadonlyUser = Readonly<User>

// Pick — select fields
type UserPublic = Pick<User, 'id' | 'name' | 'role'>

// Omit — exclude fields
type UserWithoutPassword = Omit<User, 'password'>

// Record — typed object with dynamic keys
type RolePermissions = Record<User['role'], string[]>

// ReturnType — infer what a function returns
type Products = ReturnType<typeof getProducts>

// Parameters — infer a function's argument types
type LoginArgs = Parameters<typeof login>

// NonNullable — remove null and undefined
type StrictId = NonNullable<string | null | undefined> // string
```

---

## any vs unknown vs never — when to use each?

```typescript
// any — opts out of type checking entirely. Avoid.
let x: any = 'hello'
x.foo.bar.baz  // TypeScript won't catch this error

// unknown — type-safe top type. Must narrow before using.
let y: unknown = fetchSomething()
if (typeof y === 'string') {
  console.log(y.toUpperCase())  // OK, narrowed to string
}

// never — value that can never exist. Used in exhaustive checks.
function assertNever(x: never): never {
  throw new Error('Unhandled case: ' + x)
}

type Shape = 'circle' | 'square'
function area(shape: Shape) {
  if (shape === 'circle') return Math.PI
  if (shape === 'square') return 1
  return assertNever(shape)  // TypeScript errors if Shape has more cases not handled
}
```

---

## What is Type Narrowing?

Narrowing is when TypeScript refines a broad type to a more specific one inside a branch.

```typescript
// typeof narrowing
function process(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase()  // TypeScript knows: string
  }
  return value.toFixed(2)      // TypeScript knows: number
}

// instanceof narrowing
function handleError(error: unknown) {
  if (error instanceof Error) {
    console.log(error.message)  // TypeScript knows: Error
  }
}

// 'in' narrowing
function render(element: HTMLElement | SVGElement) {
  if ('href' in element) {
    // TypeScript knows it has href
  }
}

// Discriminated union — the cleanest pattern
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

function handle(result: Result<Product>) {
  if (result.success) {
    console.log(result.data.name)   // TypeScript knows: data exists
  } else {
    console.log(result.error)       // TypeScript knows: error exists
  }
}
```

---

## What is Zod and why do you need it if you have TypeScript?

TypeScript types are erased at compile time — the browser never sees them. Data from external APIs, forms, or `localStorage` arrives as `any` at runtime. Zod validates that data at runtime and throws descriptive errors if it doesn't match.

```typescript
import { z } from 'zod'

// Define schema once
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
})

// Infer TypeScript type from schema — no duplication
type LoginForm = z.infer<typeof loginSchema>

// Runtime validation
const result = loginSchema.safeParse(formData)
if (!result.success) {
  console.log(result.error.issues)  // field-level error list
}
```

**With React Hook Form:**

```typescript
const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
  resolver: zodResolver(loginSchema)
})
```

---

## Common Interview Questions

**Q: What's the difference between `type` and `interface`?**
**A:** `interface` supports declaration merging (same name = merged) and is ideal for objects. `type` supports unions, intersections, and conditional types. For most object shapes they're interchangeable; prefer `type` for unions and `interface` for component props.

**Q: What does `z.infer<typeof schema>` do?**
**A:** Extracts the equivalent TypeScript type from a Zod schema at compile time. You write the schema once and get both runtime validation and the TypeScript type — no duplication.

**Q: What are generics for?**
**A:** Writing typed code that works with multiple types without losing type information. `Array<T>`, `Promise<T>`, `ApiResponse<T>` are built-in examples where the container is fixed but the content type varies.

**Q: When is TypeScript not enough and you need Zod?**
**A:** TypeScript only exists during development. At runtime, data from external APIs, forms, or `localStorage` is effectively `any`. Zod validates at runtime and throws if the shape doesn't match.

**Q: What is the `satisfies` operator?**
**A:** Added in TypeScript 4.9. It validates that a value matches a type without widening the type. `const config = { ... } satisfies Config` — TypeScript checks the shape but keeps the specific literal types instead of broadening to `string`.

---

## Common Mistakes

**1. Using `any` instead of `unknown`** — `any` disables all type checking. Use `unknown` and narrow it.

**2. Forgetting `null` in union types for optional data** — Supabase and most databases return `null`, not `undefined`.
```typescript
// ❌ name: string    (might be null from DB)
// ✅ name: string | null
```

**3. Duplicating types between Zod schema and TypeScript interface** — use `z.infer` to derive the type from the schema.

**4. Type assertions (`as`) instead of narrowing** — `as User` silences TypeScript without actually checking.
```typescript
// ❌ const user = data as User  (unsafe, no check at runtime)
// ✅ use Zod .parse() or type guards
```

---

## Cheat Sheet

```typescript
// ── Primitives ────────────────────────────────────────
let x: string | number | boolean | null | undefined | bigint | symbol

// ── Object types ──────────────────────────────────────
interface Obj { id: string; name?: string }    // optional with ?
type Obj = { id: string } & { name: string }   // intersection

// ── Generics ──────────────────────────────────────────
function identity<T>(x: T): T { return x }
function getById<T extends { id: string }>(items: T[], id: string) { ... }

// ── Utility types ─────────────────────────────────────
Partial<T>          // all optional
Required<T>         // all required
Readonly<T>         // immutable
Pick<T, 'a' | 'b'>  // select keys
Omit<T, 'password'> // exclude keys
Record<K, V>        // {[key: K]: V}
ReturnType<typeof fn>
Parameters<typeof fn>
NonNullable<T>

// ── Narrowing ─────────────────────────────────────────
typeof x === 'string'
x instanceof Error
'key' in obj
// discriminated union: check shared literal field

// ── Zod ───────────────────────────────────────────────
const schema = z.object({ email: z.string().email() })
type T = z.infer<typeof schema>
schema.parse(data)           // throws on failure
schema.safeParse(data)       // returns { success, data/error }

// ── any / unknown / never ─────────────────────────────
any     → opt out of type checking (avoid)
unknown → must narrow before use (safe alternative)
never   → impossible value, exhaustive checks
```
