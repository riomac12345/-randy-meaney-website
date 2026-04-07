# Randy Meaney Website

Handmade jewelry/crafts shop website built for Randy Meaney, an elderly woman who makes handmade jewelry, knits, and yarn. Designed to be simple for her to manage.

## Project Info
- **Live URL:** fluffy-gumdrop-27e94b.netlify.app
- **GitHub:** github.com/riomac12345/-randy-meaney-website
- **Local path (Windows):** C:\Users\rioma\randy-meaney-website

## Tech Stack
- Pure HTML/CSS/JS (no framework)
- Netlify Functions (CommonJS) for backend
- `@netlify/blobs` for JSON data storage (`shop-data` store, key `products`)
- Stripe Checkout Sessions for payments
- Stripe Webhooks for auto-marking items sold
- Fonts: Cormorant Garamond + Lato (Google Fonts)
- Cat logo: `cat.png`, `mix-blend-mode: multiply`

## Pages
- `index.html` — Shop page (product grid, filter bar, cart)
- `about.html` — About Randy, shops, special orders, returns
- `admin-listings.html` — Default admin landing (product listings)
- `admin.html` — Admin settings (bio, social links, shop locations, etc.)
- `success.html` — Post-checkout thank-you page
- `events.html` — Events page (newer addition)

## Netlify Environment Variables Required
- `ADMIN_PASSWORD` — admin panel password
- `NETLIFY_SITE_ID` — `8b878c16-50a7-4038-8014-5c873bd5f873`
- `NETLIFY_TOKEN` — personal access token for Netlify Blobs
- `STRIPE_SECRET_KEY` — Stripe secret key
- `STRIPE_WEBHOOK_SECRET` — for stripe-webhook.js (needs to be added)

## Key Features
- Multi-photo upload per listing (compressed to JPEG via canvas)
- Infinite listings with Add/Delete
- Categories: Jewelry, Knits & Felts, Hand Spun Yarn, Other — with filter bar on storefront
- Cart: localStorage `rm_cart`, slide-in drawer, one-of-a-kind enforcement
- Stripe multi-item checkout via `create-checkout.js`
- Stripe webhook auto-marks products as sold on purchase
- "Mark as Sold" checkbox in admin
- Cross-page admin auth via `sessionStorage` (`adminPass`)
- Social icons (Facebook/Instagram SVGs) in header, populated from settings
- Mobile responsive (breakpoints at 680px and 400px)

## TODO
- Add Stripe keys to Netlify env vars (waiting on Randy's info)
- Add `STRIPE_WEBHOOK_SECRET` to Netlify env vars after webhook registered in Stripe dashboard
- Test full Stripe checkout + webhook flow once keys are set up
