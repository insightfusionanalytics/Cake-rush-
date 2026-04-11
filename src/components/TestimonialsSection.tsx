import { useState, useEffect, useRef } from "react";

const testimonials = [
  {
    name: "Priya S.",
    text: "Ordered a mango cake for my daughter's birthday — it was absolutely divine! Fresh, moist, and beautifully decorated. Will order again!",
    rating: 5,
  },
  {
    name: "Rahul M.",
    text: "The Dutch Truffle cake was the highlight of our anniversary party. Everyone kept asking where we got it from!",
    rating: 5,
  },
  {
    name: "Sneha K.",
    text: "Best eggless cakes in town! The Red Velvet was so rich and creamy. Cake Rush never disappoints 🎂",
    rating: 5,
  },
  {
    name: "Anita D.",
    text: "Ordered customized cupcakes for a baby shower — they looked gorgeous and tasted even better. Highly recommend!",
    rating: 5,
  },
];

const TestimonialsSection = () => {
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
    <section className="py-20 bg-background" ref={ref}>
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">Testimonials</p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            What Our Clients Say
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Don't just take our word for it — hear from our happy customers!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`bg-card rounded-2xl p-6 shadow-sm border border-border transition-all duration-500 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j} className="text-primary text-lg">★</span>
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">"{t.text}"</p>
              <p className="font-heading font-semibold text-foreground">— {t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
