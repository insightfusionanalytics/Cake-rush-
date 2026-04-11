import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const cakes = [
  { name: "Belgium Chocolate", icon: "🍫", desc: "Rich Belgian cocoa layers" },
  { name: "Choco Walnut", icon: "🌰", desc: "Chocolate with crunchy walnuts" },
  { name: "Dutch Truffle", icon: "🍬", desc: "Decadent truffle ganache" },
  { name: "Biscoff Cheesecake", icon: "🍪", desc: "Creamy Biscoff-infused" },
  { name: "Red Velvet", icon: "❤️", desc: "Classic cream cheese frosting" },
  { name: "Oreo", icon: "🖤", desc: "Cookies & cream delight" },
  { name: "Strawberry", icon: "🍓", desc: "Fresh strawberry layers" },
  { name: "Pineapple", icon: "🍍", desc: "Tropical fresh pineapple" },
  { name: "Blueberry", icon: "🫐", desc: "Bursting with blueberries" },
  { name: "Mango", icon: "🥭", desc: "Seasonal Alphonso mango" },
  { name: "Mix Fruit", icon: "🍇", desc: "Assorted fresh fruits" },
  { name: "Vanilla", icon: "🍦", desc: "Timeless vanilla sponge" },
];

const desserts = [
  { name: "Chocolate Chip Brownie", icon: "🍫", desc: "Fudgy choco chip loaded" },
  { name: "Cake-Pops", icon: "🍭", desc: "Bite-sized cake on a stick" },
  { name: "Cupcakes", icon: "🧁", desc: "Fluffy with buttercream" },
  { name: "Mini Jars", icon: "🫙", desc: "Layered dessert in a jar" },
  { name: "Marble Cake", icon: "🍰", desc: "Swirled vanilla & chocolate" },
];

const MenuCard = ({ item, index }: { item: typeof cakes[0]; index: number }) => {
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
      className={`group bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <div className="text-4xl mb-3">{item.icon}</div>
      <h3 className="font-heading text-lg font-semibold text-foreground mb-1">{item.name}</h3>
      <p className="text-sm text-muted-foreground">{item.desc}</p>
    </div>
  );
};

const MenuSection = () => {
  return (
    <section
      id="menu"
      className="py-24"
      style={{
        background: "linear-gradient(180deg, hsl(var(--cream)) 0%, hsl(var(--soft-pink) / 0.3) 100%)",
      }}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">What We Offer</p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">Our Menu</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From classic flavors to unique creations — pick your favourite and order via WhatsApp!
          </p>
        </div>

        <Tabs defaultValue="cakes" className="w-full">
          <div className="flex justify-center mb-10">
            <TabsList className="bg-card/80 backdrop-blur border border-border rounded-full p-1.5 shadow-sm">
              <TabsTrigger value="cakes" className="rounded-full px-8 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
                🎂 Cakes
              </TabsTrigger>
              <TabsTrigger value="desserts" className="rounded-full px-8 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
                🍰 Desserts
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="cakes">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {cakes.map((item, i) => (
                <MenuCard key={item.name} item={item} index={i} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="desserts">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {desserts.map((item, i) => (
                <MenuCard key={item.name} item={item} index={i} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-12">
          <a href="https://wa.me/919920272566?text=Hi!%20I'd%20like%20to%20order%20a%20cake" target="_blank" rel="noopener noreferrer">
            <button className="bg-whatsapp hover:bg-whatsapp/90 text-white rounded-full px-10 py-4 text-base font-medium shadow-xl hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center gap-2">
              📱 Order Your Favourite Now
            </button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
