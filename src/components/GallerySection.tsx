import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useGalleryImages } from "@/hooks/use-site-data";

const GallerySection = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const { data: images } = useGalleryImages();

  if (!images || images.length === 0) {
    return (
      <section id="gallery" className="py-24 bg-card">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">Our Creations</p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">Our Delicious Creations</h2>
          <p className="text-muted-foreground text-lg">Loading our creations…</p>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-24 bg-card">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">Our Delicious Creations</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Every cake tells a story. Browse our collection of handcrafted creations.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelected(i)}
              className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:scale-[1.02] animate-fade-in"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <img
                src={img.image_url}
                alt={img.alt_text}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300 flex items-end">
                <span className="text-white text-sm font-medium p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                  {img.alt_text}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={selected !== null} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl p-2 bg-card border-none rounded-3xl">
          <DialogTitle className="sr-only">Cake image preview</DialogTitle>
          {selected !== null && images[selected] && (
            <img
              src={images[selected].image_url}
              alt={images[selected].alt_text}
              className="w-full h-auto rounded-2xl"
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default GallerySection;
