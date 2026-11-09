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
