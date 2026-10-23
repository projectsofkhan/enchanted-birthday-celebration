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

type Bal = { l: number; d: number; dl: number; s: number; k: number; sw: number };

function Balloons() {
  const [bals, setBals] = useState<Bal[]>([]);
  useEffect(() => {
    setBals(Array.from({ length: 9 }, (_, i) => ({
      l: i % 2 === 0 ? 2 + Math.random() * 16 : 80 + Math.random() * 16,
      d: 15 + Math.random() * 13,
      dl: -Math.random() * 24,
      s: 0.55 + Math.random() * 0.75,
      k: i % 3,
      sw: (Math.random() * 10 - 5),
    })));
  }, []);
  return (
    <div className="balloon-sky" aria-hidden="true">
      {bals.map((b, i) => (
        <span
          key={i}
          className={`balloon balloon-v${b.k}`}
          style={{
            left: `${b.l}%`,
            animationDuration: `${b.d}s`,
            animationDelay: `${b.dl}s`,
            scale: `${b.s}`,
            "--sway": `${b.sw}deg`,
          } as React.CSSProperties}
        >
          <i className="balloon-string" />
        </span>
      ))}
    </div>
  );
}

const CANDLE_COUNT = 5;
type Puff = { id: number; side: number };

function Cake() {
  const [lit, setLit] = useState<boolean[]>(() => Array(CANDLE_COUNT).fill(false));
  const [wishMade, setWishMade] = useState(false);
  const [puffs, setPuffs] = useState<Puff[]>([]);
  const [confetti, setConfetti] = useState<{ l: number; d: number; dl: number; r: number; k: number }[]>([]);
  const [micState, setMicState] = useState<"off" | "on" | "denied">("off");
  const [micHint, setMicHint] = useState("");
  const rootRef = useRef<HTMLElement>(null);
  const litRef = useRef(lit);
  const puffId = useRef(0);
  const audioRef = useRef<{ ctx: AudioContext; stream: MediaStream; raf: number } | null>(null);
  const lastBlowAt = useRef(0);
  litRef.current = lit;

  // Candles light themselves one by one when the cake scrolls into view.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const io = new IntersectionObserver((entries) => {
      if (!entries.some(e => e.isIntersecting)) return;
      io.disconnect();
      for (let i = 0; i < CANDLE_COUNT; i++) {
        timers.push(setTimeout(() => setLit(prev => prev.map((v, j) => (j === i ? true : v))), 350 + i * 320));
      }
    }, { threshold: 0.45 });
    io.observe(root);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  const burstConfetti = () => {
    setConfetti(Array.from({ length: 70 }, () => ({
      l: 8 + Math.random() * 84,
      d: 1.7 + Math.random() * 1.6,
      dl: Math.random() * 0.5,
      r: Math.random() * 720 - 360,
      k: Math.floor(Math.random() * 3),
    })));
    setTimeout(() => setConfetti([]), 4200);
  };

  const extinguishOne = () => {
    const current = litRef.current;
    const idx = current.lastIndexOf(true);
    if (idx === -1) return false;
    setLit(prev => prev.map((v, j) => (j === idx ? false : v)));
    const pid = ++puffId.current;
    setPuffs(prev => [...prev, { id: pid, side: idx }]);
    setTimeout(() => setPuffs(prev => prev.filter(p => p.id !== pid)), 1800);
    if (current.filter(Boolean).length === 1) {
      setTimeout(() => {
        setWishMade(true);
        burstConfetti();
      }, 700);
    }
    return true;
  };

  // Blow with real breath: listen to the microphone and snuff a candle on each gust.
  const startMic = async () => {
    if (micState === "on") return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.55;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      setMicState("on");
      setMicHint("Blow at your screen!");
      const loop = () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = sum / data.length;
        const now = performance.now();
        if (avg > 58 && now - lastBlowAt.current > 420) {
          lastBlowAt.current = now;
          extinguishOne();
        }
        audioRef.current!.raf = requestAnimationFrame(loop);
      };
      audioRef.current = { ctx, stream, raf: requestAnimationFrame(loop) };
    } catch {
      setMicState("denied");
      setMicHint("Mic not available — tap the candles instead.");
    }
  };

  useEffect(() => () => {
    const a = audioRef.current;
    if (a) {
      cancelAnimationFrame(a.raf);
      a.stream.getTracks().forEach(t => t.stop());
      a.ctx.close();
    }
  }, []);

  const relight = () => {
    setWishMade(false);
    setMicHint("");
    for (let i = 0; i < CANDLE_COUNT; i++) {
      setTimeout(() => setLit(prev => prev.map((v, j) => (j === i ? true : v))), 200 + i * 260);
    }
  };

  return (
    <section ref={rootRef} className="section cake-section text-center" aria-label="Birthday cake">
      <div className="cake-glow" aria-hidden />
      <div className="cake-confetti" aria-hidden>
        {confetti.map((c, i) => (
          <span
            key={i}
            className={`confetti-piece confetti-k${c.k}`}
            style={{
              left: `${c.l}%`,
              animationDuration: `${c.d}s`,
              animationDelay: `${c.dl}s`,
              rotate: `${c.r}deg`,
            }}
          />
        ))}
      </div>
      <div className="cake-stage">
        <div className="cake-candles" aria-hidden={false}>
          {lit.map((isLit, i) => (
            <button
              key={i}
              type="button"
              className={`candle${isLit ? " lit" : ""}`}
              aria-label={isLit ? "Blow out this candle" : "Candle is out"}
              onClick={() => { extinguishOne(); }}
            >
              <span className="flame" />
              <span className="flame-halo" />
              {puffs.filter(p => p.side === i).map(p => (
                <span key={p.id} className="smoke" style={{ "--i": i } as React.CSSProperties} />
              ))}
            </button>
          ))}
        </div>
        <div className="cake-tier cake-tier-top"><span className="cake-dots" /></div>
        <div className="cake-tier cake-tier-mid"><span className="cake-dots" /></div>
        <div className="cake-tier cake-tier-base"><span className="cake-dots" /><span className="cake-band" /></div>
        <div className="cake-plate" />
        <div className="cake-shadow" aria-hidden />
      </div>
      <div className="invitation-divider" aria-hidden><i className="fa-solid fa-leaf" /></div>
      {!wishMade ? (
        <div className="cake-cta reveal-on">
          <p className="eyebrow">MAKE A WISH, THEN BLOW THE CANDLES AWAY</p>
          <div className="cake-cta-row">
            <Button asChild variant="outline" className="wed-btn"><button type="button" onClick={startMic}><i className="fa-solid fa-wind" aria-hidden />{micState === "on" ? "Listening…" : "Blow with your breath"}</button></Button>
            <Button asChild variant="outline" className="wed-btn"><button type="button" onClick={extinguishOne}><i className="fa-solid fa-hand-pointer" aria-hidden />Tap a candle</button></Button>
          </div>
          {micHint && <p className="cake-mic-hint">{micHint}</p>}
        </div>
      ) : (
        <div className="cake-wish reveal-on">
          <i className="fa-solid fa-star cake-wish-star" aria-hidden />
          <p className="cake-wish-line">Happy Birthday, {INVITATION.name.split(" ")[0]}!</p>
          <p className="eyebrow">YOUR WISH IS ON ITS WAY</p>
          <div className="cake-cta-row">
            <Button asChild variant="outline" className="wed-btn"><button type="button" onClick={relight}><i className="fa-solid fa-fire" aria-hidden />Light them again</button></Button>
          </div>
        </div>
      )}
    </section>
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
    const fallbackTimer = setTimeout(finish, 4500);
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
            gsap.from(".curtain-rope, .tassel", { opacity: 0, duration: 0.8, stagger: .05, ease: "power3.out" });
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
            tl.to(".curtain-garland", { y: -22, opacity: 0, scale: .94, duration: .55, ease: "power2.in" }, .05)
              .to(".curtain-gyp", { y: -28, opacity: 0, scale: .94, duration: .55, ease: "power2.in", stagger: .04 }, .12)
              .to(".valance-swag", { yPercent: -170, opacity: 0, duration: .6, ease: "power2.in" }, .22)
              .to(".curtain-valance", { yPercent: -130, opacity: 0, duration: .65, ease: "power3.in" }, .26)
              .to(".curtain-rope, .tassel", { opacity: 0, duration: .35 }, .35)
              .to(".curtain-left", { xPercent: -106, scaleX: .82, skewY: -5, duration: 1.05, ease: "power4.inOut" }, .4)
              .to(".curtain-right", { xPercent: 106, scaleX: .82, skewY: 5, duration: 1.05, ease: "power4.inOut" }, .4)
              .to(".wed-main", { opacity: 1, duration: .9, ease: "power2.out" }, .75)
              .fromTo(".hero-anim", { opacity: 0, y: 22, rotationX: -14 }, { opacity: 1, y: 0, rotationX: 0, stagger: .07, duration: .8, ease: "power3.out" }, .85)
              .fromTo(".hero-fade", { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 1.1, stagger: .09, ease: "power2.out" }, .85)
              .to(".curtain-wrap", { opacity: 0, duration: .35, ease: "power1.in" }, 1.15);
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
      <Balloons />
      <div className="curtain-wrap" aria-hidden="true">
        <span className="curtain-garland" aria-hidden><img src={gypGarland} width={1920} height={704} alt="" /></span>
        <div className="curtain-valance"><div className="curtain-trim" /><span className="valance-swag swag-left" /><span className="valance-swag swag-center" /><span className="valance-swag swag-right" /></div>
        <div className="curtain-panel curtain-left">
          <span className="curtain-folds" />
          <span className="curtain-silk" /><span className="curtain-rope" /><span className="tassel" />
          <span className="curtain-gyp" aria-hidden><img src={gypSpray} width={1024} height={1600} alt="" /></span>
        </div>
        <div className="curtain-panel curtain-right">
          <span className="curtain-folds" />
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

        <Cake />

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
