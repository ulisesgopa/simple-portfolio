---
author: Ulises Gómez
publishDate: 2025-04-05T10:00:00Z
title: TypeScript for Frontend — What You Actually Need to Know
tags:
    - TypeScript
    - JavaScript
    - Frontend
    - React
description: The TypeScript concepts that appear in real projects — interfaces, types, generics, and Zod validation — with examples from the portfolio and production work.
cover:
  src: './images/customizing-user-information/cover.webp'
  alt: 'TypeScript for Frontend'
---

## Why TypeScript and Not Just JavaScript

TypeScript adds static types to JavaScript. Types are checked at **compile time** (when you write the code), not at runtime (when the user runs it in the browser).

The result: the most common bugs — undefined properties, wrong arguments, mistyped data — are caught before you deploy.

```typescript
// JavaScript — the bug appears in production when the user hits it
function getProductName(product) {
  return product.name.toUpperCase() // what if product is undefined?
}

// TypeScript — the bug appears while you're writing the code
function getProductName(product: Product) {
  return product.name.toUpperCase() // TypeScript knows Product has .name
}
```

---

## `type` vs `interface` — When to Use Each

This is one of the most frequent interview questions.

```typescript
// interface — for describing the shape of an object
interface Product {
  id: string
  name: string
  price: number
  categoryId: string
}

// type — more versatile, can describe anything
type ProductId = string
type Status = 'active' | 'inactive' | 'draft'  // union type
type ApiResponse<T> = { data: T; error: null } | { data: null; error: string }
```

**Practical rule:**
- Use `interface` for objects and component contracts (props)
- Use `type` for unions, primitive aliases, and complex types

**The real difference:** `interface` can be extended with `extends` and can be re-declared (merging). `type` can't be re-declared but supports more complex operations (`|`, `&`, conditionals).

---

## Type Patterns in My Projects

### In POS Colombia — Business Domain

```typescript
// types/index.ts — all domain types in one place

interface Product {
  id: string
  name: string
  price: number
  stock: number
  categoryId: string
  category?: Category  // optional relation — may not be loaded
  createdAt: string
  updatedAt: string
}

interface Sale {
  id: string
  total: number
  status: 'open' | 'completed' | 'cancelled'  // union type — only these values
  items: SaleItem[]
  cashSessionId: string
  customerId?: string  // optional — can be a sale without a customer
  createdAt: string
}

interface SaleItem {
  productId: string
  quantity: number
  unitPrice: number
  subtotal: number
}

// DTO — Data Transfer Object — the data that goes in a POST
interface CreateSaleDto {
  items: Array<{
    productId: string
    quantity: number
  }>
  customerId?: string
}
```

### In PeludoTag — Supabase Data

```typescript
interface Pet {
  id: string
  owner_id: string
  name: string
  breed: string | null    // null when the field hasn't been filled
  age: number | null
  notes: string | null
  photo_url: string | null
  qr_code_url: string
  created_at: string
}

// For forms — only the required fields
type CreatePetForm = Pick<Pet, 'name' | 'breed' | 'age' | 'notes'>
//                   ↑ Pick extracts only the properties I need
```

---

## Utility Types — The Most Used Ones

TypeScript has built-in helper types that operate on other types:

```typescript
interface User {
  id: string
  name: string
  email: string
  password: string
  role: 'admin' | 'cashier'
}

// Partial — all fields optional (for updates)
type UpdateUserDto = Partial<User>
// { id?: string; name?: string; email?: string; ... }

// Pick — select only some fields
type UserPublic = Pick<User, 'id' | 'name' | 'role'>
// { id: string; name: string; role: 'admin' | 'cashier' }

// Omit — exclude some fields
type UserWithoutPassword = Omit<User, 'password'>
// { id: string; name: string; email: string; role: ... }

// Record — for objects with dynamic keys
type CategoryMap = Record<string, Category>
// { [key: string]: Category }
```

---

## Generics — Reusable Typed Code

Generics are like parameters for types. They let you write typed code that works with any type.

```typescript
// Without generics — must repeat for every type
function getFirstProduct(items: Product[]): Product {
  return items[0]
}

function getFirstUser(items: User[]): User {
  return items[0]
}

// With generics — one function, correct typing for any type
function getFirst<T>(items: T[]): T {
  return items[0]
}

const product = getFirst<Product>(products)  // TypeScript knows it's a Product
const user = getFirst<User>(users)            // TypeScript knows it's a User
```

### Generics in Practice — API Response

```typescript
// A generic type for all API responses
interface ApiResponse<T> {
  data: T
  meta: {
    total: number
    page: number
  }
}

// Usage
type ProductsResponse = ApiResponse<Product[]>
type SaleResponse = ApiResponse<Sale>

async function getProducts(): Promise<ApiResponse<Product[]>> {
  const response = await fetch('/api/products')
  return response.json()
}
```

---

## Zod — Runtime Validation

TypeScript disappears in the browser — its types only exist during development. **Zod** does the same thing but at runtime: it validates that data coming from an API or a form is what you expect.

This portfolio uses it in Content Collections:

```typescript
// src/content/config.ts
import { z } from 'astro:content'

const projects = defineCollection({
  schema: ({ image }) => z.object({
    title: z.string(),
    startDate: z.date(),
    endDate: z.date(),
    summary: z.string(),
    url: z.string(),
    cover: image(),           // Astro's special type for images
    tags: z.array(z.string()),
    ogImage: z.string()
  }),
})
```

If an MDX file is missing `title` or has the wrong date format, the build fails with a clear error — instead of failing silently in production.

### Zod in Forms — React Hook Form

In **POS Colombia** and **Tienda Patitas**, I use Zod together with React Hook Form:

```typescript
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// 1. Define the validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
})

// 2. Infer the TypeScript type from the schema (don't repeat yourself)
type LoginForm = z.infer<typeof loginSchema>
//               ↑ Zod generates the type automatically from the schema

// 3. Use it in the component
function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)  // connect Zod to React Hook Form
  })

  const onSubmit = async (data: LoginForm) => {
    // data is typed and validated — TypeScript and Zod both guarantee this
    await login(data.email, data.password)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Login</button>
    </form>
  )
}
```

---

## What I Should Be Able to Explain in Interviews

1. **The difference between `type` and `interface`?** — `interface` can be extended and re-declared (merging), ideal for objects. `type` supports unions, intersections, and conditional types. For most object use cases they're interchangeable.

2. **What is `z.infer<typeof schema>` in Zod?** — It extracts the equivalent TypeScript type from the Zod schema. Avoids duplicating the definition: you define the schema once and get both runtime validation and the TypeScript type.

3. **What are generics for?** — Writing typed code that works with multiple types without losing type information. `Array<T>`, `Promise<T>`, and `ApiResponse<T>` are examples where the container is always the same but the content type varies.

4. **When is TypeScript not enough and you need Zod?** — TypeScript only exists at development time. At runtime, data from external APIs, forms, or localStorage is `any`. Zod validates that data at runtime and throws descriptive errors if it doesn't match what's expected.

---

## Resources to Go Deeper

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Zod Documentation](https://zod.dev/)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
