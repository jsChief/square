# square

A minimalist student marketplace with genAI functionalities.

Built with **Next.js (React) + TypeScript + Tailwind CSS**. Listings are read
from an existing Supabase project (`test_products` + `test_stores`). Accounts
use **Supabase Auth**, and orders and Paystack payments are written through an
authenticated, cookie-based Supabase client so RLS applies to every mutation.

The appearance menu in the header combines **light/dark mode** with five
**accent color themes** (Forest, Ocean, Ember, Plum, Slate). Both preferences
are saved locally, default to the system color scheme on first visit, and apply
before first paint. Everything is driven by CSS variables, so colors update
instantly across the whole app.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Fill in `.env.local` using
`.env.example` before using accounts or payments.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project structure

```
app/
  (auth)/                    # sign-in, sign-up, email confirmation, recovery
  api/ai/route.ts            # server-side model call with sample fallback
  auth/callback/route.ts     # exchanges Supabase email-link codes for a session
  listings/[id]/checkout/    # Paystack checkout
  listings/[id]/             # listing detail with "Buy now"
  listings/                  # browse, search, filter
  orders/[id]/               # order detail, receipts, pay-unpaid-order
  orders/                    # order list
  sell/                      # create a listing (AI-assisted)
  globals.css                # design tokens + theme colors
  layout.tsx                 # shared header/footer layout
  page.tsx                   # landing page
assets/                      # source brand icon files (ICO + PNG)
components/
  checkout/                  # checkout form
  orders/                    # pay button, status badge, order actions
  theme-provider.tsx         # theme + mode state and persistence
  theme-picker.tsx           # combined appearance menu
lib/
  auth/                      # verified user and profile helpers
  auth-actions.ts            # Supabase Auth server actions
  data.ts                    # maps Supabase product/store rows to listings
  database.types.ts          # generated Biz Link schema types
  orders/                    # order actions and queries
  payments/                  # Paystack helpers and Inline loader
  supabase.ts                # public read-only Supabase client
  supabase/server.ts         # cookie-based authenticated Supabase client
  preview-otp.ts             # local preview code helper
  themes.ts                  # available accent themes
  utils.ts                   # formatting + class helpers
proxy.ts                     # refreshes Supabase sessions and gates protected routes
types/                       # shared TypeScript types
tailwind.config.ts           # Tailwind theme mapped to CSS variables
```

## Data source

The app reads approved, unblocked rows from `public.test_products` and joins
them to `public.test_stores` for seller names and locations. Database categories
are mapped to square's UI categories in `lib/data.ts`.

Orders are written to the existing `orders` and `payment_receipts` tables using
the signed-in user's Supabase session. Buyers can only create and pay for their
own orders; sellers can accept, decline, or cancel orders they own.

## Accounts

Sign-up and sign-in use real Supabase Auth (email + password). Confirmation and
password-reset links are sent by Supabase and complete at `/auth/callback`.
Protected routes (`/sell`, `/checkout`, `/orders`) redirect signed-out visitors
to `/login?next=...`. The OTP screens remain local previews and are not part of
the authentication flow.

Set `NEXT_PUBLIC_SITE_URL` if you want email links to use a fixed origin;
otherwise the host of the incoming request is used.

## Payments

Payments use Paystack Inline (NGN) and the existing order tables:

1. Buyers open `/listings/{id}/checkout`, confirm quantity and receipt email,
   and click **Pay with Paystack**.
2. Paystack Inline creates the charge in the browser and returns a `reference`.
   The reference is saved in `localStorage` so a lost confirmation can be
   retried without paying twice.
3. A Server Action verifies the reference with Paystack's
   `transaction/verify` endpoint using `PAYSTACK_SECRET_KEY`, checks the amount,
   currency, buyer, and listing, then inserts an `orders` row and a
   `payment_receipts` row.
4. Buyers land on `/orders/{id}?placed=1`. Unpaid pay-on-pickup orders can be
   paid later from the order page with **Pay now**, which uses
   `payOrderAction`.

If either Paystack key is missing, or the public/secret keys are from different
modes, online payments are disabled and the checkout offers a purchase request
instead. Paystack sends the buyer's receipt email; square stores the reference
and amount.

Known gap: there is no Paystack webhook or reconciliation job yet. Verification
is driven by the browser callback and the reference retry path.

## AI drafts

Set one of `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or
`GOOGLE_GENERATIVE_AI_API_KEY` to enable real description drafts.
`AI_PROVIDER` can pin one provider (`openai`, `anthropic`, or `google`);
otherwise the first configured key is used. When
no key is configured, the form receives a clearly labelled sample draft instead
of a model-generated one.

## Next steps

- Add server-side writes so published listings can be inserted into `test_products`
- Add optional student verification using the existing `profiles` / `student_verifications` tables
- Add image upload and messaging
- Add a Paystack webhook and reconciliation for delayed or disputed payments
