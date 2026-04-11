import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMenuCategories, useMenuItems, useSiteSettings } from "@/hooks/use-site-data";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const MenuCard = ({ item, index }: { item: any; index: number }) => {
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
    <div
      ref={ref}
      className={`group bg-card/80 backdrop-blur-sm rounded-2xl p-5 border border-border/50 shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
      <h3 className="font-heading text-lg font-semibold text-foreground mb-1">{item.name}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
      {item.price && (
        <p className="text-primary font-semibold mt-2 text-sm">Starting from {item.price}</p>
      )}
    </div>
  );
};

const MenuSection = () => {
  const { data: categories } = useMenuCategories();
  const { data: items } = useMenuItems();
  const { data: settings } = useSiteSettings();
  const whatsapp = settings?.whatsapp_number || "919920272566";

  const activeItems = items?.filter((i) => i.is_active) || [];

  return (
    <section id="menu" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">What We Offer</p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">Our Menu</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From classic favourites to custom creations — there's something for every celebration.
          </p>
        </div>

        {categories && categories.length > 0 && (
          <Tabs defaultValue={categories[0].id} className="w-full">
            <TabsList className="w-full max-w-md mx-auto mb-10 bg-secondary/60 backdrop-blur-sm rounded-full p-1">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="flex-1 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-medium"
                >
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((cat) => (
              <TabsContent key={cat.id} value={cat.id}>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {activeItems
                    .filter((item) => item.category_id === cat.id)
                    .map((item, i) => (
                      <MenuCard key={item.id} item={item} index={i} />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}

        <div className="text-center mt-12">
          <a href={`https://wa.me/${whatsapp}?text=Hi!%20I'd%20like%20to%20order`} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-whatsapp hover:bg-whatsapp/90 text-white rounded-full px-10 py-6 text-base shadow-xl hover:shadow-2xl transition-all hover:scale-105">
              <MessageCircle className="mr-2 h-5 w-5" />
              Order Your Favourite Now
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
