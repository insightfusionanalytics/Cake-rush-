

## Cake Rush Website — Updated Build Plan

### Menu Items (from reference image)

**Cakes (Flavours):**
Belgium Chocolate, Choco Walnut, Dutch Truffle, Biscoff Cheesecake, Red Velvet, Oreo, Strawberry, Pineapple, Blueberry, Mango, Mix Fruit, Vanilla

**Desserts:**
Chocolate Chip Brownie, Cake-Pops, Cupcakes, Mini Jars, Marble Cake

### Design System
- **Palette**: Cream (#FFF8F0), soft pink (#F9E4E4), peach (#FDEBD0), lavender (#E8D5F5), dark text (#3D2C2E), accent pink (#E91E63)
- **Fonts**: Playfair Display (headings), Inter (body) via Google Fonts
- **Style**: Rounded corners (16px), soft shadows, pastel gradients, fade-in scroll animations

### Components to Build

1. **Navbar.tsx** — Sticky, smooth-scroll links (Home, About, Menu, Gallery, Contact), WhatsApp CTA button, mobile hamburger
2. **HeroSection.tsx** — "Baked with Love" heading, subtext, two CTAs (WhatsApp green + Instagram gradient), hero cake image
3. **AboutSection.tsx** — Split layout: brand story text + featured cake image
4. **MenuSection.tsx** — Two category tabs: "Cakes" and "Desserts" with the exact items above shown as clean pastel cards in a grid
5. **GallerySection.tsx** — Responsive grid of all 21 enhanced cake images with click-to-enlarge Dialog lightbox
6. **ContactSection.tsx** — WhatsApp button (wa.me/919920272566), Instagram button, "Delivery Available" badge
7. **Footer.tsx** — Simple footer with brand name, social links
8. **WhatsAppFloat.tsx** — Fixed bottom-right floating WhatsApp button

### Technical Steps
1. Copy uploaded logo to `src/assets/logo.png`
2. Copy all 21 enhanced cake PNGs from `/mnt/documents/` to `public/gallery/`
3. Update `index.html` with Google Fonts link (Playfair Display + Inter)
4. Update `src/index.css` with pastel CSS variables
5. Update `tailwind.config.ts` with custom colors and fade-in animation
6. Build all 8 components
7. Wire everything in `src/pages/Index.tsx` as a single-page layout
8. Ensure fully responsive mobile-first design

### Output
Single-page conversion-focused bakery website with all 21 gallery images, exact menu from reference, and prominent WhatsApp ordering CTAs throughout.

