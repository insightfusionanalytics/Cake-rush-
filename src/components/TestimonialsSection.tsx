import { useEffect, useRef, useState } from "react";
import { useTestimonials } from "@/hooks/use-site-data";

const TestimonialsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { data: testimonials } = useTestimonials();

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [testimonials]);

  if (!testimonials || testimonials.length === 0) return null;

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
              key={t.id}
              className={`bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-lg transition-all duration-500 hover:-translate-y-1 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j} className="text-primary text-lg">★</span>
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">"{t.review_text}"</p>
              <p className="font-heading font-semibold text-foreground">— {t.client_name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
