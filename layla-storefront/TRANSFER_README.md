# Layla Storefront — VS Code Transfer Guide

This folder contains the complete editable React, Tailwind, Express, tRPC, Drizzle, and Vitest source for the Layla storefront. It is prepared for local editing in VS Code.

## Requirements

Install Node.js 20 or newer and pnpm 10 or newer. From this project folder, run:

```bash
pnpm install
pnpm check
pnpm test
pnpm dev
```

Then open the local URL printed by the development server. The storefront itself is client-side and includes local copies of the generated editorial images under `client/public/images`, so the main shopping experience can be edited and previewed locally without relying on hosted image paths.

## Main files to edit

| File | Purpose |
| --- | --- |
| `client/src/pages/Home.tsx` | Main storefront layout, catalogue data, search/filtering, product dialog, favourites, bag, and newsletter interactions |
| `client/src/index.css` | Pastel editorial theme, typography, responsive styling, focus states, and motion rules |
| `client/index.html` | Page title and metadata |
| `client/public/images/` | Local storefront imagery |
| `server/storefront.test.ts` | Storefront helper regression tests |
| `client/src/lib/storefront.ts` | Reusable bag and filtering helpers |

## Notes

The exported storefront uses client-side product data and localStorage for favourites and bag persistence. The checkout button is currently a storefront interaction placeholder; connect a real commerce provider such as Shopify or Stripe before accepting payments. The original Manus project configuration and deployment metadata are included, but Manus-specific authentication and hosted integrations may require their environment variables when running those server features locally.

No customer reviews, ratings, or testimonials are included.
