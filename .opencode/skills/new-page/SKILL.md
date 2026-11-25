---
name: New Page
description: Add a new page or route to the square Next.js app using its App Router structure, Tailwind design tokens, and reusable components. Use when asked to create a new page, route, or screen in this project.
---

# New Page

Follow the conventions already used in `app/page.tsx` and `app/listings/page.tsx`.

## Workflow

1. Read `README.md` for the current project structure and `app/globals.css` for the available design tokens.
2. Create the route under `app/` with an App Router folder, for example `app/<route>/page.tsx`.
3. Default-export a React component. When the page reads query parameters, make it `async` and type `searchParams` as a `Promise`, as in `app/listings/page.tsx` (Next.js 16).
4. Style with semantic token classes such as `bg-surface`, `border-line`, `text-muted`, `text-accent`, `bg-accent`, `text-accent-contrast`, and `bg-accent-soft`. Do not hard-code hex colors; the theme must keep working in light/dark mode and across all five accent themes.
5. Wrap page content in a container like `mx-auto max-w-6xl px-4 py-12 sm:px-6`.
6. Reuse existing pieces instead of duplicating them: `components/` for UI (`ListingCard`, `SearchBar`, `SiteHeader`, `SiteFooter`) and `lib/utils.ts` for `cn`, `formatPrice`, and label maps.
7. Import project files with the `@/` alias.
8. Run `npm run lint` and `npm run build` before reporting the work as complete.
