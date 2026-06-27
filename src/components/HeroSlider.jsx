"use client";

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSettings } from "../hooks/useSettings";
import styles from "./HeroSlider.module.css";

// ─── Per-slide Focal Point Config ────────────────────────────────────────────
// Maps each slide filename to its own composition settings.
// objectPosition: CSS background-position value that keeps the model in frame.
// scale: (1.0–1.08) slight scale-up can shift visible crop without changing CSS
// NOTE: keys are matched by the END of the src string (filename) so they work
//       with both local paths (/hero_slide_1.jpg) and CDN URLs.
const SLIDE_CONFIG = {
  "hero_slide_1.jpg": {
    objectPosition:       "65% center", // desktop: model on right, text space on left
    mobileObjectPosition: "50% center", // mobile: centered, full viewport
  },
  "hero_slide_2.jpg": {
    objectPosition:       "60% center",
    mobileObjectPosition: "50% center",
  },
  "hero_slide_3.jpg": {
    objectPosition:       "70% center",
    mobileObjectPosition: "50% center",
  },
};

/** Returns the focal config for a given src URL (falls back to centered) */
function getFocalConfig(src) {
  const key = Object.keys(SLIDE_CONFIG).find((k) => src.endsWith(k));
  return key ? SLIDE_CONFIG[key] : { objectPosition: "center center" };
}

// ─── Memoized Slide ──────────────────────────────────────────────────────────
// Each slide is its own component so only the two changing slides re-render
// during a transition. Idle slides never re-render.
const HeroSlide = memo(function HeroSlide({ src, state }) {
  const className = [
    styles.heroSlide,
    state === "active" ? styles.active : "",
    state === "prev"   ? styles.prev   : "",
  ]
    .filter(Boolean)
    .join(" ");

  const { objectPosition, mobileObjectPosition = "50% center" } = getFocalConfig(src);

  return (
    <div className={className}>
      <div className={styles.heroBackground}>
        <Image
          src={src}
          alt="Hero background"
          fill
          className={styles.heroImage}
          priority={state === "active"}
          sizes="100vw"
          // Use CSS custom properties so the stylesheet media query
          // can override object-position on mobile without fighting
          // inline style specificity.
          style={{
            "--focal-desktop": objectPosition,
            "--focal-mobile":  mobileObjectPosition,
          }}
        />
      </div>
      <div className={styles.heroOverlay} />
    </div>
  );
});


// ─── Main Slider ─────────────────────────────────────────────────────────────
export default function HeroSlider({ initialSettings }) {
  const { settings } = useSettings(initialSettings);

  // Memoised so heroSettings object reference is stable between renders
  const heroSettings = useMemo(
    () =>
      settings?.hero || {
        slides: ["/hero_slide_1.jpg", "/hero_slide_2.jpg", "/hero_slide_3.jpg"],
        title: "Everyday Style. Premium Comfort.",
        subtitle:
          "Discover the new standard of modern luxury menswear. Designed for the discerning individual.",
        buttonText: "Shop Collection",
        buttonLink: "/shop",
      },
    [settings?.hero]
  );

  // Use a ref for indices so the interval callback never needs to be recreated
  const indexRef   = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex,    setPrevIndex]    = useState(-1);
  const [imagesLoaded, setImagesLoaded]  = useState(false);

  // ── Preload images ──────────────────────────────────────────────────────────
  useEffect(() => {
    const slides = heroSettings.slides;
    if (!slides?.length) { setImagesLoaded(true); return; }

    let mounted = true;
    let loaded  = 0;

    const onDone = () => {
      loaded++;
      if (mounted && loaded >= slides.length) setImagesLoaded(true);
    };

    slides.forEach((src) => {
      const img  = new window.Image();
      img.onload = onDone;
      img.onerror= onDone; // don't block on broken images
      img.src    = src;
    });

    return () => { mounted = false; };
  }, [heroSettings.slides]);

  // ── Advance slides using requestAnimationFrame for precise timing ───────────
  useEffect(() => {
    if (!imagesLoaded || heroSettings.slides.length <= 1) return;

    const DISPLAY_MS    = 5000;  // how long each slide shows
    const TRANSITION_MS = 1200;  // must match CSS transition duration

    let rafId;
    let lastTick = performance.now();

    const tick = (now) => {
      if (now - lastTick >= DISPLAY_MS) {
        lastTick = now;
        const next = (indexRef.current + 1) % heroSettings.slides.length;
        // Batch both state updates into a single React render via unstable_batchedUpdates
        // In React 18 they are already batched, but we separate them so
        // we can drive prevIndex independently without double-ticking.
        setPrevIndex(indexRef.current);
        indexRef.current = next;
        setCurrentIndex(next);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [imagesLoaded, heroSettings.slides.length]);

  // ── Stable title lines (avoid splitting string every render) ───────────────
  const titleLines = useMemo(
    () => heroSettings.title.split("\n"),
    [heroSettings.title]
  );

  return (
    <section className={styles.hero}>
      {heroSettings.slides.map((src, index) => {
        const state =
          index === currentIndex ? "active" :
          index === prevIndex    ? "prev"   : "idle";

        return (
          <HeroSlide key={src} src={src} state={state} />
        );
      })}

      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>
          {titleLines.map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </h1>
        <p className={styles.heroSubtitle}>{heroSettings.subtitle}</p>
        <div className={styles.heroButtons}>
          <Link href={heroSettings.buttonLink} className={styles.btnPrimary}>
            {heroSettings.buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
}
