import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMenuCategories, useMenuItems, useAllMenuItemPrices, useSiteSettings } from "@/hooks/use-site-data";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const MenuCard = ({ item, prices, whatsapp }: { item: any; prices: any[]; whatsapp: string }) => (
  <div className="group bg-card/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1 animate-fade-in">
    {item.image_url ? (
      <div className="aspect-square overflow-hidden">
        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
      </div>
    ) : (
      <div className="aspect-square bg-secondary/30 flex items-center justify-center">
        <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
      </div>
    )}
    <div className="p-4">
      <h3 className="font-heading text-lg font-semibold text-foreground mb-1">{item.name}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-3">{item.description}</p>

      {item.is_custom_only ? (
        <a
          href={`https://wa.me/${whatsapp}?text=Hi!%20I'd%20like%20a%20quote%20for%20${encodeURIComponent(item.name)}`}
          target="_blank" rel="noopener noreferrer"
        >
          <Button size="sm" variant="outline" className="w-full rounded-full text-xs border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            Request a Quote
          </Button>
        </a>
      ) : prices.length > 0 ? (
        <div className="space-y-1">
          {prices.map((p) => (
            <div key={p.id} className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{p.weight_label}</span>
              <span className="font-semibold text-primary">{p.price}</span>
            </div>
          ))}
        </div>
      ) : item.price ? (
        <p className="text-primary font-semibold text-sm">Starting from {item.price}</p>
      ) : null}
    </div>
  </div>
);

const MenuSection = () => {
  const { data: categories } = useMenuCategories();
  const { data: items } = useMenuItems();
  const { data: allPrices } = useAllMenuItemPrices();
  const { data: settings } = useSiteSettings();
  const whatsapp = settings?.whatsapp_number || "919920272566";
  const activeItems = items?.filter((i) => i.is_active) || [];

  const getPrices = (itemId: string) =>
    (allPrices || []).filter((p) => p.menu_item_id === itemId).sort((a, b) => a.sort_order - b.sort_order);

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
                <TabsTrigger key={cat.id} value={cat.id} className="flex-1 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-medium">
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((cat) => (
              <TabsContent key={cat.id} value={cat.id}>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {activeItems.filter((item) => item.category_id === cat.id).map((item) => (
                    <MenuCard key={item.id} item={item} prices={getPrices(item.id)} whatsapp={whatsapp} />
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
