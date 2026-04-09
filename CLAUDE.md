# Randy Meaney Website

Handmade jewelry/crafts shop website built for Randy Meaney, an elderly woman who makes handmade jewelry, knits, and yarn. Designed to be simple for her to manage.

## Project Info
- **Live URL:** teal-salmiakki-12708b.netlify.app
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



## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `node serve.mjs` (serves the project root at `http://localhost:3000`)
- `serve.mjs` lives in the project root. Start it in the background before taking any screenshots.
- If the server is already running, do not start a second instance.

## Screenshot Workflow
- Puppeteer is installed locally (`node_modules/puppeteer`). Chrome is at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:3000`
- Screenshots are saved automatically to `./temporary screenshots/screenshot-N.png` (auto-incremented, never overwritten).
- Optional label suffix: `node screenshot.mjs http://localhost:3000 label` → saves as `screenshot-N-label.png`
- `screenshot.mjs` lives in the project root. Use it as-is.
- After screenshotting, read the PNG from `temporary screenshots/` with the Read tool — Claude can see and analyze the image directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

## Output Defaults
- Single `index.html` file, all styles inline, unless user says otherwise
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

## Brand Assets
- Always check the `brand_assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color

