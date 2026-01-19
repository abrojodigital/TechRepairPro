# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TechRepairPro is a repair shop management system built with Next.js 16 and Supabase. It helps tech repair businesses track repairs, manage customers, and maintain inventory.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run lint     # Run ESLint
npm run start    # Start production server
```

## Tech Stack

- **Framework**: Next.js 16 with App Router and React 19
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5

## Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (protected)/        # Routes requiring authentication (dashboard, repairs, customers, inventory)
│   ├── auth/               # Public auth routes (login, signup)
│   └── page.tsx            # Root redirect handler
├── components/
│   └── layout/             # Sidebar and Header components
├── lib/
│   └── supabase/           # Supabase client utilities (client.ts, server.ts, middleware.ts)
└── types/
    └── database.ts         # TypeScript types for database tables
```

### Route Groups

- `(protected)` - Uses a shared layout with Sidebar/Header, requires authentication via middleware
- `auth` - Public login/signup pages

### Supabase Integration

- **Client-side**: Use `createClient()` from `@/lib/supabase/client` (call inside event handlers, not at module level)
- **Server-side**: Use `createClient()` from `@/lib/supabase/server` (async, uses cookies)
- **Middleware**: Session refresh handled in `src/middleware.ts`

### Database Schema

Core tables defined in `supabase/schema.sql`:
- `customers` - Customer contact information
- `devices` - Devices brought in for repair (linked to customers)
- `repairs` - Repair tickets with status tracking (linked to devices and customers)
- `inventory` - Parts and supplies with stock tracking
- `repair_parts` - Junction table linking parts used in repairs
- `profiles` - User profiles extending Supabase auth

Repair statuses: `pending`, `diagnosed`, `in_progress`, `waiting_parts`, `completed`, `delivered`, `cancelled`

### Type Safety

Database types are defined in `src/types/database.ts`. When querying Supabase, cast responses to proper types:

```typescript
const { data: customers } = await supabase
  .from("customers")
  .select("*") as { data: Customer[] | null };
```

## Setup

1. Copy `.env.local.example` to `.env.local`
2. Add Supabase project URL and anon key from your Supabase dashboard
3. Run the SQL schema in `supabase/schema.sql` via Supabase SQL Editor
