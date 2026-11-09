# I Know… You Don’t

A private-room multiplayer card game built with Next.js, Supabase and Vercel.

## Project status

Foundational database schema is in place. The web application is being built in small, reviewable stages.

## Game catalog

- 72 Character Cards: 4 animals × 3 colors × 6 numbers
- 5 initial Rule Cards
- Private game state is server-controlled; secret rules and player hands must never be exposed to unauthorized clients.

## Planned stack

- Next.js + TypeScript
- Tailwind CSS
- Framer Motion
- Supabase Postgres + Realtime
- Vercel

## Development principles

- The server is authoritative for all game actions and rule evaluation.
- Every state-changing action is validated server-side and supports idempotency.
- Private hands and hidden rules are stored separately from public room information.
- All database tables use Row Level Security; game tables are accessed by trusted server code only.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set the Supabase project URL and publishable key.
4. Set `SUPABASE_SERVICE_ROLE_KEY` for server-side room operations only.
5. In Supabase Dashboard, enable **Authentication → Sign-In / Providers → Anonymous Sign-Ins**.
6. Start the app with `npm run dev`.

Do not prefix the service-role key with `NEXT_PUBLIC_`, commit it, or expose it to browser code.

## Current room flow

- Create a room with a display name, or join one using its six-character code.
- Players are represented by Supabase anonymous Auth sessions; no email or password is required.
- The lobby displays the room roster and refreshes every five seconds while Realtime updates are being implemented.
- A room can hold 3–7 players.

## Database migrations

The SQL migrations are stored in `supabase/migrations`. They create the initial schema, harden same-room foreign keys, and add guest identity plus server-only room RPCs.
