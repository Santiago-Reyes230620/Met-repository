# Agent Guide

## Project Shape

- This is a Next.js App Router application for Michigan English Test practice. Routes and pages live in `app/`.
- Shared product UI belongs in `components/shared/`; reusable shadcn/Radix-style primitives belong in `components/ui/`.
- Authenticated, reusable feature behavior belongs in `hooks/`; pure calculations, access rules, date rotation, fallback content, payment helpers, and error normalization belong in `lib/`.
- `contexts/AuthContext.tsx` owns Supabase session state, profile loading, authentication actions, and profile updates. `app/layout.tsx` provides it globally.
- Use the existing `cn` helper, UI primitives, Lucide icons, and shared navigation/footer patterns before introducing new equivalents.

## Commands

Use Node 20 and install with `npm ci`.

```text
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

Run `npm run verify:stripe` when changing Stripe configuration or checkout behavior. Tests use Vitest with jsdom and live in `test/`; add focused coverage for changed hooks, payment routes, Supabase behavior, or shared business logic.

Run lint, typecheck, tests, and build before considering a change complete. The same checks run in [CI](.github/workflows/ci.yml).

## Data, Auth, And Payments

- Browser data access uses the singleton in `lib/supabase/client.ts`.
- Server-only privileged access uses `lib/supabase/admin.ts`. Never expose `SUPABASE_SERVICE_ROLE_KEY` or other secret provider keys to client code.
- User-scoped database queries must respect the existing RLS model, generally using `auth.uid() = id` or `auth.uid() = user_id`.
- Use `mapSupabaseErrorMessage` for user-facing Supabase errors.
- Subscription entitlements are centralized in `lib/subscription-access.ts`; update that map when adding a gated feature.
- Stripe and Mercado Pago checkout/webhook boundaries are under `app/api/stripe/` and `app/api/mercadopago/`. Validate authorization in API routes independently of the client.
- Payment subscription writes must happen through trusted server routes or webhooks, not client-side database mutations.
- Grammar, vocabulary, and reading content can combine database data with deterministic fallback content; local development must not assume seeded content exists.
- Free exercise limits and daily rotation are shared behavior. Preserve `hooks/use-daily-limit.ts` and `lib/date-utils.ts` semantics when changing practice flows.

## Database And Environment

- Apply files in `supabase/migration/` in chronological order before diagnosing missing-table, RLS, or premium persistence failures. Treat migrations as the database source of truth.
- Start local configuration from `.env.example`; at minimum, Supabase URL/key and `NEXT_PUBLIC_APP_URL` are required. Payment flows need additional server-only secrets and provider configuration.
- Only variables prefixed `NEXT_PUBLIC_` may be used in browser code.
- Netlify configuration is in `netlify.toml`. Set environment variables for both Preview and Production.
- `next.config.js` disables development Webpack caching for synced folders such as OneDrive; preserve this unless the development environment changes.

## Documentation

- Setup, scripts, environment variables, release steps, and smoke tests: [README.md](README.md)
- Release and CI details: [docs/releases/v0.1.0-release-ready.md](docs/releases/v0.1.0-release-ready.md)
- Migration source of truth: [supabase/migration/](supabase/migration/)

Keep this file focused on agent-facing conventions. Put detailed procedures and product documentation in the linked docs instead of duplicating them here.