

## Cake Image Enhancement for Cake Rush

### What I'll Do
Edit all 5 cake images using AI image editing (Gemini image model) to produce professional-quality product photos. Each image will be individually processed and saved as a separate PNG.

### Per-Image Editing

1. **Holi Cake** (rainbow cake) — Enhance colors and sharpness. Replace outdoor/tree background with a soft pastel indoor setup on a clean marble surface with gentle warm lighting.

2. **Women's Day Cake** (white floral cake) — Improve white balance and detail. Replace leafy background with an elegant minimal table setting — light linen cloth, soft window light, clean composition.

3. **Easter Cake** (dark chocolate) — Boost contrast and texture detail. Replace busy greenery background with a warm wooden table surface, soft bokeh background, cozy home aesthetic.

4. **Birthday Cake - Pallavi** (chocolate with roses) — Enhance gold/chocolate tones. Replace checkered tablecloth background with a premium dark backdrop with subtle warm lighting, luxury feel.

5. **Mango Cake** (yellow with mango pieces) — Enhance mango colors and cream texture. Replace window background with a bright, airy kitchen counter with natural sunlight and soft depth-of-field.

### Process
- Copy each uploaded image to the workspace
- Use the AI image editing script (`lovable_ai.py --edit-image`) with carefully crafted prompts for each cake
- Use the higher-quality model (`google/gemini-3-pro-image-preview`) for best results
- Save each as individual PNG to `/mnt/documents/`
- QA each output image visually before delivering

### Output
5 individual PNG files:
- `cake_holi_enhanced.png`
- `cake_womens_day_enhanced.png`
- `cake_easter_enhanced.png`
- `cake_birthday_pallavi_enhanced.png`
- `cake_mango_enhanced.png`

