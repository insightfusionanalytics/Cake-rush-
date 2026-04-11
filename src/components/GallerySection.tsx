import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const images = [
  { src: "/gallery/cake_strawberry_v2_enhanced.png", alt: "Strawberry cake" },
  { src: "/gallery/cake_gold_black_enhanced.png", alt: "Gold & black themed cake" },
  { src: "/gallery/cake_pink_pearl_enhanced.png", alt: "Pink pearl cake" },
  { src: "/gallery/cake_holi_enhanced.png", alt: "Colorful Holi cake" },
  { src: "/gallery/cake_bride_enhanced.png", alt: "Bridal cake" },
  { src: "/gallery/cake_mango_enhanced.png", alt: "Mango cake" },
  { src: "/gallery/cake_womens_day_enhanced.png", alt: "Women's day cake" },
  { src: "/gallery/cake_easter_enhanced.png", alt: "Easter themed cake" },
  { src: "/gallery/cake_green_floral_enhanced.png", alt: "Green floral cake" },
  { src: "/gallery/cake_dancing_queen_v2_enhanced.png", alt: "Dancing queen cake" },
  { src: "/gallery/cake_birthday_pallavi_enhanced.png", alt: "Birthday cake" },
  { src: "/gallery/cake_chocolate_truffle_pro.png", alt: "Chocolate truffle cake" },
  { src: "/gallery/cake_white_fruit_enhanced.png", alt: "White fruit cake" },
  { src: "/gallery/cake_basketweave_enhanced.png", alt: "Basketweave cake" },
  { src: "/gallery/cake_red_velvet_pro.png", alt: "Red velvet berry cake" },
  { src: "/gallery/cake_nandini_v2_enhanced.png", alt: "Designer cake" },
  { src: "/gallery/cake_pineapple_enhanced.png", alt: "Pineapple cake" },
  { src: "/gallery/cake_hazelnut_enhanced.png", alt: "Hazelnut cake" },
  { src: "/gallery/cake_vanilla_macaron_pro.png", alt: "Vanilla macaron cake" },
  { src: "/gallery/cake_aditya_v2_enhanced.png", alt: "Birthday celebration cake" },
  { src: "/gallery/cake_sreyas_v2_enhanced.png", alt: "Designer birthday cake" },
];

const GallerySection = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="gallery" className="py-24 bg-card" ref={ref}>
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">Our Creations</p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">Gallery</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Every cake tells a story. Browse our collection of handcrafted creations.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {images.map((img, i) => (
            <button
              key={img.src}
              onClick={() => setSelected(i)}
              className={`group relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:scale-[1.02] ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300 flex items-end">
                <span className="text-white text-sm font-medium p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                  {img.alt}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={selected !== null} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl p-2 bg-card border-none rounded-3xl">
          <DialogTitle className="sr-only">Cake image preview</DialogTitle>
          {selected !== null && (
            <img
              src={images[selected].src}
              alt={images[selected].alt}
              className="w-full h-auto rounded-2xl"
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default GallerySection;
