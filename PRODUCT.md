# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Primary users are people in a local, campus-adjacent community selling things they no longer need and buying preloved items nearby. The marketplace is not limited to students; campus is a location cue, not an eligibility rule.
- Seller's job: turn an item they no longer need into a clear listing quickly, set a fair price, and pass it on locally.
- Buyer's job: find a needed item nearby, judge its condition and seller, and arrange a local pickup.
- Students may verify their status optionally to earn a trust badge. Verification is not a requirement to participate.

## Product Purpose

square makes local secondhand exchange easy enough to become the default: give preloved things a second life, get better deals, and waste less. Success looks like a seller publishing a usable listing in under a minute with AI assistance and a nearby buyer finding it and arranging pickup.

## Positioning

A local reuse marketplace where AI removes the listing friction: the seller supplies a title, category, condition, and price, and AI drafts the description for the seller to review and edit. The differentiator is the combination of low-fuss local exchange and AI-assisted listing, not AI as a novelty.

## Operating Context

- Sellers list items they no longer need. Buyers browse featured listings, search by keyword, filter by category, and open a detail page showing price, condition, pickup location, description, seller name, seller campus, and rating.
- Exchange happens through local pickup rather than shipping.
- UI categories are textbooks, electronics, furniture, clothing, tickets, beauty, food, and other. Database category values are mapped into these UI categories. Conditions are brand new, like new, good, fair, or "condition not listed" when the database has no value. Prices are in NGN.
- The experience runs in a browser; appearance preferences are stored locally and applied before first paint.

## Capabilities and Constraints

- Committed roadmap: add server-side writes for published listings; add optional student verification as a trust badge; add photo upload and messaging; add Paystack webhook reconciliation.
- The current implementation uses the existing Biz Link Supabase project: approved, unblocked `test_products` rows joined to `test_stores` supply live listings and seller details. Supabase Auth (email + password) replaces the demo session, and authenticated writes create orders and payment receipts in the existing `orders` / `payment_receipts` tables. Paystack Inline handles one-time NGN payments with server-side reference verification. Listing drafts use a server-side provider when a model key is configured and a clearly labelled sample otherwise; "Preview listing" only renders an inline local preview and photo upload is not implemented.
- Open decision: how the optional student badge is earned, displayed, and trusted has not been specified.
- Provider keys stay server-side (`.env.example` lists AI and Paystack key slots). The Paystack public key is browser-safe; the secret key is only used for verification on the server.
- The current build offers light/dark mode and five accent themes (Forest, Ocean, Ember, Plum, Slate), persisted locally and defaulting to the system color scheme. This is documented current behavior, not a confirmed binding product promise.

## Brand Commitments

- Name: square, written lowercase with a trailing accent dot ("square.") in the header, footer, and page titles.
- Logo assets: `assets/squareIcon_1024_2x.png` and `assets/squareIcon_1024_2x.ico`, also copied into `app/` as the favicon and Apple touch icon.
- Existing copy says "Built for students, by students" and "Made for campus life." The confirmed audience is broader than students, so treat those lines as legacy copy rather than a binding audience restriction.

## Evidence on Hand

- Live read-only listings from `public.test_products` (16 rows at inspection time) with seller details joined from `public.test_stores`; `lib/data.ts` maps their existing values into the app's `Listing` type without modifying the database.
- `README.md` documents the current architecture, AI provider setup, and next milestones; `lib/ai.ts` contains the prompts and provider parsing.
- No real customers, testimonials, case studies, press, benchmarks, or deployment and licensing claims are available; future work must not fabricate them.

## Product Principles

1. Remove listing friction with AI: let the seller supply minimal facts, draft the description automatically, and keep the seller in control of the final text.
2. Keep exchange local: optimize for nearby discovery and pickup, not shipping logistics.
3. Reuse first: make giving preloved items a second life the default, with less waste and better deals as the payoff.
4. Be honest about prototype state: present placeholder behavior as placeholder, never implying that uploads, messages, or webhook reconciliation already exist. Accounts and one-time Paystack payments are now real; the OTP screens are still labelled previews.
5. Build the full loop deliberately: database, real AI, optional student trust badge, photos, messaging, and payments are planned scope that should be designed together rather than bolted on.
