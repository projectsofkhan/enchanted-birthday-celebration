import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { INVITATION, OPENING_PAUSE_MS } from "@/lib/invitation";
import whiteFlorals from "@/assets/green-white-florals.png";
import gypSpray from "@/assets/gypsophila-spray.png";
import gypGarland from "@/assets/gypsophila-garland.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mohd Shamir — Birthday Invitation" },
      { name: "description", content: "You are cordially invited to Mohd Shamir’s birthday celebration on Sunday, 25 October, at Gulshan e navab, Islamnagar Ghasipura, Bhopal." },
      { property: "og:title", content: "Mohd Shamir — Birthday Invitation" },
      { property: "og:description", content: "Birthday celebration · Sunday, 25 October · Gulshan e navab, Bhopal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Flake = { kind: "petal" | "gyp"; l: number; d: number; dl: number; s: number; o: number };

function Rain() {
  const [flakes, setFlakes] = useState<Flake[]>([]);
  useEffect(() => {
    setFlakes(Array.from({ length: 56 }, (_, i) => {
      const kind = i % 3 === 2 ? "gyp" : "petal";
      return {
        kind,
        l: Math.random() * 100,
        d: kind === "gyp" ? 8 + Math.random() * 8 : 10 + Math.random() * 11,
        dl: Math.random() * -18,
        s: kind === "gyp" ? 0.45 + Math.random() * 0.7 : 0.6 + Math.random() * 0.8,
        o: kind === "gyp" ? 0.5 + Math.random() * 0.4 : 0.55 + Math.random() * 0.3,
      };
    }));
  }, []);
  return (
    <>
      {flakes.map((p, i) => (
        <span
          key={i}
          className={p.kind === "gyp" ? "gyp-dot" : "petal"}
          style={{
            left: `${p.l}%`,
            animationDuration: `${p.d}s`,
            animationDelay: `${p.dl}s`,
            scale: `${p.s}`,
            opacity: p.o,
          }}
        />
      ))}
    </>
  );
}

function Index() {
  const [revealed, setRevealed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.add("wed", "invitation-closed");
    let disposed = false;
    let raf = 0;
    let openingTimer: ReturnType<typeof setTimeout> | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let context: ReturnType<typeof import("gsap").gsap.context> | undefined;
    let lenis: import("lenis").default | undefined;
    const root = rootRef.current;
    const finish = () => {
      if (disposed) return;
      const curtain = root?.querySelector<HTMLElement>(".curtain-wrap");
      const main = root?.querySelector<HTMLElement>(".wed-main");
      if (curtain) {
        curtain.style.opacity = "0";
        hideTimer = setTimeout(() => {
          if (curtain) curtain.style.display = "none";
        }, 420);
      }
      if (main) main.style.opacity = "1";
      document.body.classList.remove("invitation-closed");
      setRevealed(true);
      lenis?.start();
    };
    // The invitation must remain reachable even if animation libraries fail to load.
    const fallbackTimer = setTimeout(finish, 7000);
    (async () => {
      try {
        const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
          import("gsap"), import("gsap/ScrollTrigger"), import("lenis"),
        ]);
        if (disposed || !root) return;
        gsap.registerPlugin(ScrollTrigger);
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        lenis = new Lenis({ duration: 1.15, smoothWheel: !reduced });
        lenis.stop();
        lenis.on("scroll", ScrollTrigger.update);
        const loop = (time: number) => {
          lenis?.raf(time);
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        context = gsap.context(() => {
          if (!reduced) {
            gsap.from(".curtain-rope, .tassel", { opacity: 0, duration: 1.4, stagger: .08, ease: "power3.out" });
          }
        }, root);
        openingTimer = setTimeout(() => {
          if (disposed) return;
          context?.add(() => {
            const tl = gsap.timeline({ onComplete: () => {
              clearTimeout(fallbackTimer);
              finish();
              ScrollTrigger.refresh();
            } });
            if (reduced) {
              tl.to(".wed-main", { opacity: 1, duration: .2 }).to(".curtain-wrap", { opacity: 0, duration: .2 }, 0);
              return;
            }
            // Florals flutter away, valance lifts, panels sweep open, then the curtain melts away.
            tl.to(".curtain-garland", { y: -26, opacity: 0, scale: .94, duration: .9, ease: "power2.in" }, .2)
              .to(".curtain-gyp", { y: -34, opacity: 0, scale: .94, duration: .9, ease: "power2.in", stagger: .06 }, .3)
              .to(".valance-swag", { yPercent: -170, opacity: 0, duration: 1, ease: "power2.in" }, .45)
              .to(".curtain-valance", { yPercent: -130, opacity: 0, duration: 1.1, ease: "power3.in" }, .5)
              .to(".curtain-rope, .tassel", { opacity: 0, duration: .5 }, .7)
              .to(".curtain-left", { xPercent: -106, scaleX: .82, skewY: -6, duration: 2, ease: "power4.inOut" }, .7)
              .to(".curtain-right", { xPercent: 106, scaleX: .82, skewY: 6, duration: 2, ease: "power4.inOut" }, .7)
              .to(".wed-main", { opacity: 1, duration: 1.2, ease: "power2.out" }, 1.4)
              .fromTo(".hero-anim", { opacity: 0, y: 26, rotationX: -18 }, { opacity: 1, y: 0, rotationX: 0, stagger: .1, duration: .95, ease: "power3.out" }, 1.6)
              .fromTo(".hero-fade", { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 1.5, stagger: .12, ease: "power2.out" }, 1.6)
              .to(".curtain-wrap", { opacity: 0, duration: .45, ease: "power1.in" }, 2.3);
            gsap.utils.toArray<HTMLElement>(".reveal", root).forEach((el) => {
              gsap.from(el, { opacity: 0, y: 40, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } });
            });
            gsap.utils.toArray<HTMLElement>(".floral-pair", root).forEach((el) => {
              gsap.fromTo(el, { y: 8 }, { y: -8, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: 1.5 } });
            });
          });
        }, OPENING_PAUSE_MS);
      } catch {
        openingTimer = setTimeout(finish, OPENING_PAUSE_MS);
      }
    })();
    return () => {
      disposed = true;
      clearTimeout(openingTimer);
      clearTimeout(fallbackTimer);
      clearTimeout(hideTimer);
      cancelAnimationFrame(raf);
      context?.revert();
      lenis?.destroy();
      document.body.classList.remove("wed", "invitation-closed");
    };
  }, []);

  return (
    <div ref={rootRef} className="birthday-invitation">
      <div className="floral-bg" aria-hidden />
      <Rain />
      <div className="curtain-wrap" aria-hidden="true">
        <span className="curtain-garland" aria-hidden><img src={gypGarland} width={1920} height={704} alt="" /></span>
        <div className="curtain-valance"><div className="curtain-trim" /><span className="valance-swag swag-left" /><span className="valance-swag swag-right" /></div>
        <div className="curtain-panel curtain-left">
          <span className="curtain-silk" /><span className="curtain-rope" /><span className="tassel" />
          <span className="curtain-gyp" aria-hidden><img src={gypSpray} width={1024} height={1600} alt="" /></span>
        </div>
        <div className="curtain-panel curtain-right">
          <span className="curtain-silk" /><span className="curtain-rope" /><span className="tassel" />
          <span className="curtain-gyp" aria-hidden><img src={gypSpray} width={1024} height={1600} alt="" /></span>
        </div>
      </div>

      <main className="wed-main" inert={!revealed}>
        <section className="section hero birthday-hero">
          <div className="floral-pair hero-florals" aria-hidden="true">
            <span className="hero-garland" aria-hidden><img src={gypGarland} width={1920} height={704} alt="" /></span>
            <span className="hero-floral floral-left hero-fade"><img src={whiteFlorals} width={1024} height={1536} alt="" /></span>
            <span className="hero-floral floral-right hero-fade"><img src={whiteFlorals} width={1024} height={1536} alt="" /></span>
            <span className="hero-gyp gyp-left hero-fade"><img src={gypSpray} width={1024} height={1600} alt="" /></span>
            <span className="hero-gyp gyp-right hero-fade"><img src={gypSpray} width={1024} height={1600} alt="" /></span>
          </div>
          <div className="birthday-ornament hero-anim" aria-hidden><i className="fa-solid fa-cake-candles" /></div>
          <p className="eyebrow hero-anim birthday-invited">YOU ARE CORDIALLY INVITED</p>
          <p className="eyebrow hero-anim birthday-to">TO THE</p>
          <h1 className="display birthday-title hero-anim">Birthday</h1>
          <p className="eyebrow hero-anim birthday-celebration">CELEBRATION</p>
          <div className="invitation-divider hero-anim" aria-hidden><i className="fa-solid fa-leaf" /></div>
          <p className="eyebrow hero-anim">OF</p>
          <h2 className="display birthday-name hero-anim">{INVITATION.name}</h2>
        </section>

        <section className="section birthday-day text-center" aria-label="Celebration date">
          <time dateTime={INVITATION.date} className="birthday-date-block reveal"><span className="birthday-day-number">25</span><span className="eyebrow birthday-month">OCT</span><span className="eyebrow birthday-weekday">SUNDAY</span></time>
        </section>

        <section className="section birthday-wish text-center" aria-label="Birthday wish">
          <div className="invitation-divider reveal" aria-hidden><i className="fa-solid fa-leaf" /></div>
          <p className="birthday-wish-line reveal">May your day be sprinkled with laughter,</p>
          <p className="birthday-wish-line reveal">your year with joy, and your heart</p>
          <p className="birthday-wish-line reveal">with every wish come true.</p>
          <div className="invitation-divider reveal" aria-hidden><i className="fa-solid fa-leaf" /></div>
        </section>

        <section className="section birthday-venue text-center" aria-label="Venue">
          <div className="floral-pair venue-florals" aria-hidden="true">
            <span className="section-floral floral-left"><img src={whiteFlorals} width={1024} height={1536} loading="lazy" alt="" /></span>
            <span className="section-floral floral-right"><img src={whiteFlorals} width={1024} height={1536} loading="lazy" alt="" /></span>
          </div>
          <i className="fa-solid fa-location-dot venue-pin reveal" aria-hidden />
          <p className="eyebrow reveal">VENUE</p>
          <h2 className="display venue-name reveal">{INVITATION.venue}</h2>
          <div className="venue-address reveal">{INVITATION.address.map(line => <p key={line}>{line}</p>)}</div>
          <div className="reveal venue-map">
            <Button asChild variant="outline" className="wed-btn"><a href="https://www.google.com/maps/search/?api=1&query=Gulshan+e+navab+Islamnagar+Ghasipura+Bhopal" target="_blank" rel="noreferrer"><i className="fa-solid fa-map-location-dot" aria-hidden />View on Map</a></Button>
          </div>
        </section>

        <section className="section birthday-close text-center" aria-label="Closing">
          <div className="invitation-divider reveal" aria-hidden><i className="fa-solid fa-leaf" /></div>
          <p className="eyebrow reveal">SEE YOU ON</p>
          <p className="birthday-close-date display reveal">25 OCT · SUNDAY</p>
          <p className="birthday-close-love reveal">With love &amp; blessings</p>
        </section>
      </main>
    </div>
  );
}
