import { useEffect, useRef, useState } from "react";

const AboutSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="py-24 bg-card" ref={ref}>
      <div className="container mx-auto px-4 md:px-8">
        <div className={`flex flex-col lg:flex-row items-center gap-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          {/* Image */}
          <div className="flex-1 flex justify-center">
            <div className="w-72 h-72 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-xl border-2 border-soft-pink">
              <img
                src="/gallery/cake_womens_day_enhanced.png"
                alt="Beautifully decorated cake"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">Our Story</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Crafted with Passion
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              At Cake Rush, every cake is a masterpiece. We use the finest ingredients to create freshly baked, beautifully decorated cakes that make your celebrations unforgettable. From classic flavors to custom designs — we pour love into every layer.
            </p>
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
              {[
                { emoji: "🎂", label: "Custom Designs" },
                { emoji: "🌿", label: "Fresh Ingredients" },
                { emoji: "💜", label: "Made with Love" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 bg-secondary rounded-full px-5 py-2.5">
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
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
