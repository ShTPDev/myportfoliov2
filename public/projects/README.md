# Project screenshots

Drop project screenshots here. Each project has its own folder named by slug:

```
public/projects/
├── m3-marketplace/
├── traysoft/
├── sif-it-system/
├── belibet/
├── belizehomes/
├── m3-inventory-manager/
└── caribbean-bridges/
```

## How to wire a screenshot in

1. Save the image at `public/projects/<slug>/<filename>.png` (or `.jpg`, `.webp`).
2. Open `src/data/ecosystem.ts`, find the matching project entry.
3. Replace its `gallery: []` line with:

```ts
gallery: [
  {
    src: "/projects/m3-marketplace/admin-dashboard.png",
    alt: "Admin dashboard — order management view",
    caption: "Admin · Orders",
  },
  {
    src: "/projects/m3-marketplace/customer-checkout.png",
    alt: "Customer mobile app — checkout screen",
    caption: "Mobile · Checkout",
  },
],
```

The `<StickyCaseStudy>` component automatically renders the gallery as a
2-column grid of `next/image` figures with the caption below each. If
`gallery` is empty (`[]`), nothing renders — no broken images.

## Recommended shots per project (for the main two)

### M3 Marketplace
- Customer mobile app — home / discovery
- Customer mobile app — product detail
- Customer mobile app — checkout (showing payment provider picker)
- Admin web — dashboard with FL Charts
- Admin web — orders table
- Admin web — fraud-detection panel
- Marketplace web storefront — landing

### TraySoft Payment Module
- Stripe hosted payment page in flight
- Belize Bank gateway redirect / capture flow
- Admin fraud risk-score panel (0–100 score with factor breakdown)
- Subscription lifecycle screen (trial / pause / resume)
- Test runner output showing 543/543 tests passing

## Image sizing

`next/image` is using `fill` + an `aspect-[16/10]` wrapper, so the
image will cover the box and crop. Aim for source images at roughly
**1600×1000** or larger. Wider screenshots crop cleanly; narrower
mobile screenshots will letterbox.
