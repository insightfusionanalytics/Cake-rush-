# Cake Rush — Deployment Guide

This is a Vite + React + TypeScript app backed by Supabase.

## 1. Environment variables

Copy [.env.example](.env.example) to `.env` and fill in real values from the
Supabase dashboard (**Project Settings → API**). All three vars are required:

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Project REST URL, e.g. `https://abcd.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon / publishable key — safe to ship to the browser |
| `VITE_SUPABASE_PROJECT_ID` | Used by generated types |

> Never commit `.env`. It is in `.gitignore`. Use the *publishable* (anon) key — never the service-role key.

## 2. Build

```bash
npm install
npm run build
```

Output goes to `dist/`. The build is fully static — no Node server needed at runtime.

Verify locally:

```bash
npm run preview   # serves dist/ on http://127.0.0.1:4173
```

## 3. Deploy targets

### Vercel (recommended — `vercel.json` already configured)

1. Import the repo in the Vercel dashboard.
2. Framework preset: **Vite** (auto-detected).
3. Add the three `VITE_SUPABASE_*` env vars under **Settings → Environment Variables** for *Production*, *Preview*, and *Development*.
4. Deploy. The included `vercel.json` rewrites all paths to `index.html` for SPA routing.

```bash
# Or via CLI
npm i -g vercel
vercel --prod
```

### Netlify

1. New site from Git → set **Build command:** `npm run build`, **Publish directory:** `dist`.
2. Add env vars under **Site settings → Environment variables**.
3. Add a `_redirects` file (or `netlify.toml`) for SPA fallback:
   ```
   /*  /index.html  200
   ```

### Static host / S3 / Cloudflare Pages / GitHub Pages

Upload `dist/` as static assets. Configure the host to fall back to `/index.html` for unknown paths so React Router works.

## 4. Pre-deploy checklist

- [ ] `npm run build` succeeds
- [ ] `npm run preview` shows the home page with no console errors
- [ ] Env vars set in the deploy provider (production *and* preview)
- [ ] Supabase **RLS** enabled on `site_settings`, `menu_categories`, `menu_items`, `menu_item_prices`, `gallery_images`, `testimonials` — read for `anon`, write only for authenticated admins
- [ ] Custom domain pointed at the deploy (DNS / CNAME)
- [ ] Selenium suite green: `tests/.venv/bin/python tests/test_cake_rush.py --headless --url=<deployed-url>`

## 5. Post-deploy smoke test

```bash
# Replace with your real URL
tests/.venv/bin/python tests/test_cake_rush.py --headless --url=https://your-domain.com
```

The suite (62 assertions) checks the navbar, hero, philosophy ticker, about, the "house favourites" tab grid, the editorial collection rows, lookbook + lightbox, dark testimonials, contact columns, footer, the floating WhatsApp pill, smooth scrolling, and console-error cleanliness.

## 6. Notes

- **Bundle size:** main JS is ~586 KB / 171 KB gzipped. Acceptable for an editorial site; if you want to trim it later, dynamic-import the Admin page and Recharts.
- **Hero image:** `src/assets/about-cake.png` is 2 MB (imported, not in `public/`). Consider re-exporting at lower resolution if Lighthouse complains.
- **Print PDF:** the design includes A4 print styles (see `@media print` block in `src/index.css`). Open the live site → browser print dialog → Save as PDF, with "Background graphics" enabled.
