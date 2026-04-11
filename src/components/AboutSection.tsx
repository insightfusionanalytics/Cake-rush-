import { useSiteSettings } from "@/hooks/use-site-data";
import aboutCake from "@/assets/about-cake.png";

const AboutSection = () => {
  const { data: settings } = useSiteSettings();

  const features = (settings?.about_features || "Custom Designs,Fresh Ingredients,Made with Love").split(",");
  const featureIcons = ["🎂", "🌿", "💜"];

  return (
    <section id="about" className="py-24 bg-card">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 animate-fade-in">
          <div className="flex-1 flex justify-center">
            <div className="w-72 h-72 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-xl border-2 border-soft-pink">
              <img
                src={aboutCake}
                alt="Playful half birthday cake with teddy bear"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1 text-center lg:text-left">
            <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">
              {settings?.about_subheading || "Our Story"}
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              {settings?.about_heading || "Crafted with Passion"}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              {settings?.about_text || ""}
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              {features.map((f, i) => (
                <div key={f} className="flex items-center gap-2 bg-secondary/80 backdrop-blur-sm rounded-full px-5 py-2.5 border border-border/50">
                  <span className="text-xl">{featureIcons[i] || "✨"}</span>
                  <span className="text-sm font-medium text-foreground">{f.trim()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
