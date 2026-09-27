"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Chaque particule occupe STRIDE cases dans un Float32Array (plus rapide qu'un tableau d'objets).
const STRIDE = 13;
const X = 0, Y = 1, TX = 2, TY = 3, VX = 4, VY = 5, STIFFNESS = 6; // prettier-ignore
const SX = 7, SY = 8, CX = 9, CY = 10, DELAY = 11, DURATION = 12; // prettier-ignore

const MAX_PARTICLES = 6000;

// Assemblage initial (en millisecondes) : chaque particule suit une courbe depuis un
// point aléatoire, avec un léger décalage de départ.
const INTRO_MAX_DELAY = 700;
const INTRO_MIN_DURATION = 1800;
const INTRO_EXTRA_DURATION = 1000;
const INTRO_CURVE = 140;
/** Distance max hors écran d'où partent les particules. */
const INTRO_OFFSCREEN = 150;

// Interaction avec le pointeur (physique ressort + friction).
const POINTER_RADIUS = 90;
const POINTER_FORCE = 6;
const FRICTION = 0.85;

type ParticleNameProps = {
  text: string;
  className?: string;
};

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/**
 * Affiche un texte formé de particules qui arrivent des deux bords de l'écran au
 * chargement et que la souris disperse. Le vrai <h1> reste dans le DOM, masqué
 * visuellement, pour le SEO et les lecteurs d'écran.
 *
 * Le canvas couvre tout le premier ancêtre positionné (la section du hero) pour que les
 * particules puissent voler sur toute sa surface ; le conteneur ne fait que réserver
 * la place du texte.
 */
export function ParticleName({ text, className }: ParticleNameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!container || !canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0, active: false };

    let particles = new Float32Array(0);
    let count = 0;
    let dotSize = 2;
    let width = 0; // taille du canvas (toute la section)
    let height = 0;
    let textWidth = 0; // largeur du conteneur du texte
    let color = "";
    let frame = 0;
    let visible = true;
    let disposed = false;
    /** Horodatage du début de l'assemblage ; null une fois celui-ci terminé. */
    let introStart: number | null = null;

    function readColor() {
      // Le canvas porte la classe text-primary : sa couleur calculée suit le thème.
      color = getComputedStyle(canvas!).color;
    }

    /** Calcule la taille du texte, le dessine hors écran et en échantillonne les pixels. */
    function layout(withIntro: boolean) {
      textWidth = container!.clientWidth;
      if (textWidth === 0) return;

      const fontFamily = getComputedStyle(canvas!).fontFamily;
      const font = (size: number) => `600 ${size}px ${fontFamily}`;
      ctx!.font = font(100);

      // Une ligne si possible, sinon coupure au premier espace (prénom / nom).
      let lines = [text];
      let size = Math.min((textWidth / ctx!.measureText(text).width) * 100 * 0.98, 150);
      const spaceIndex = text.indexOf(" ");
      if (size < 64 && spaceIndex > 0) {
        lines = [text.slice(0, spaceIndex), text.slice(spaceIndex + 1)];
        const widest = Math.max(...lines.map((line) => ctx!.measureText(line).width));
        size = Math.min((textWidth / widest) * 100 * 0.98, 150);
      }

      const lineHeight = size * 1.1;
      const textHeight = Math.ceil(lines.length * lineHeight);
      // Le conteneur réserve la hauteur du texte dans la mise en page…
      container!.style.height = `${textHeight}px`;

      // …et le canvas couvre la section : on lit sa taille une fois la hauteur appliquée.
      const canvasRect = canvas!.getBoundingClientRect();
      const textRect = container!.getBoundingClientRect();
      const offsetX = textRect.left - canvasRect.left;
      const offsetY = textRect.top - canvasRect.top;
      width = canvasRect.width;
      height = canvasRect.height;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const offscreen = document.createElement("canvas");
      offscreen.width = textWidth;
      offscreen.height = textHeight;
      const offCtx = offscreen.getContext("2d", { willReadFrequently: true })!;
      offCtx.font = font(size);
      offCtx.textBaseline = "middle";
      lines.forEach((line, i) => offCtx.fillText(line, 0, lineHeight * (i + 0.5)));
      const pixels = offCtx.getImageData(0, 0, textWidth, textHeight).data;

      // Pas d'échantillonnage proportionnel à la taille du texte, élargi si trop de points.
      let gap = Math.max(2, Math.round(size / 30));
      let targets: number[] = [];
      do {
        targets = [];
        for (let y = 0; y < textHeight; y += gap) {
          for (let x = 0; x < textWidth; x += gap) {
            if (pixels[(y * textWidth + x) * 4 + 3] > 128) targets.push(x + offsetX, y + offsetY);
          }
        }
        gap++;
      } while (targets.length / 2 > MAX_PARTICLES);
      dotSize = Math.max(1.2, (gap - 1) * 0.62);

      const previous = particles;
      const previousCount = count;
      count = targets.length / 2;
      particles = new Float32Array(count * STRIDE);

      for (let i = 0; i < count; i++) {
        const p = i * STRIDE;
        const tx = targets[i * 2];
        const ty = targets[i * 2 + 1];
        particles[TX + p] = tx;
        particles[TY + p] = ty;
        particles[STIFFNESS + p] = 0.02 + Math.random() * 0.03;

        if (reduceMotion) {
          particles[X + p] = tx;
          particles[Y + p] = ty;
        } else if (!withIntro && i < previousCount) {
          // Redimensionnement : on repart des positions actuelles, le ressort fait le reste.
          particles[X + p] = previous[i * STRIDE + X];
          particles[Y + p] = previous[i * STRIDE + Y];
        } else {
          // Départ hors écran, à gauche ou à droite, à une hauteur aléatoire.
          const fromLeft = Math.random() < 0.5;
          const outside = 10 + Math.random() * INTRO_OFFSCREEN;
          const sx = fromLeft ? -outside : width + outside;
          const sy = Math.random() * height;
          particles[X + p] = sx;
          particles[Y + p] = sy;
          particles[SX + p] = sx;
          particles[SY + p] = sy;
          // Point de contrôle décalé du milieu du trajet : trajectoire courbe.
          particles[CX + p] = (sx + tx) / 2 + (Math.random() - 0.5) * 2 * INTRO_CURVE;
          particles[CY + p] = (sy + ty) / 2 + (Math.random() - 0.5) * 2 * INTRO_CURVE;
          particles[DELAY + p] = Math.random() * INTRO_MAX_DELAY;
          particles[DURATION + p] = INTRO_MIN_DURATION + Math.random() * INTRO_EXTRA_DURATION;
        }
      }
    }

    /** Position pendant l'assemblage (courbe de Bézier quadratique). Renvoie false si terminé. */
    function introStep(p: number, elapsed: number) {
      const t = Math.min(
        Math.max((elapsed - particles[DELAY + p]) / particles[DURATION + p], 0),
        1,
      );
      const e = easeOutCubic(t);
      const a = (1 - e) ** 2;
      const b = 2 * (1 - e) * e;
      const c = e ** 2;
      particles[X + p] = a * particles[SX + p] + b * particles[CX + p] + c * particles[TX + p];
      particles[Y + p] = a * particles[SY + p] + b * particles[CY + p] + c * particles[TY + p];
      return t < 1;
    }

    /** Ressort vers la cible + répulsion du pointeur. Renvoie false si la particule est au repos. */
    function physicsStep(p: number) {
      let x = particles[X + p];
      let y = particles[Y + p];
      let vx = particles[VX + p];
      let vy = particles[VY + p];

      const stiffness = particles[STIFFNESS + p];
      vx += (particles[TX + p] - x) * stiffness;
      vy += (particles[TY + p] - y) * stiffness;

      if (pointer.active) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < POINTER_RADIUS && distance > 0.01) {
          const force = (1 - distance / POINTER_RADIUS) * POINTER_FORCE;
          vx += (dx / distance) * force;
          vy += (dy / distance) * force;
        }
      }

      vx *= FRICTION;
      vy *= FRICTION;
      x += vx;
      y += vy;

      particles[X + p] = x;
      particles[Y + p] = y;
      particles[VX + p] = vx;
      particles[VY + p] = vy;

      return (
        Math.abs(vx) + Math.abs(vy) > 0.02 ||
        Math.abs(particles[TX + p] - x) + Math.abs(particles[TY + p] - y) > 0.3
      );
    }

    /** Avance d'un pas et dessine. Renvoie true si tout est immobile. */
    function step(now: number) {
      ctx!.clearRect(0, 0, width, height);
      ctx!.fillStyle = color;
      let moving = false;
      const elapsed = introStart === null ? null : now - introStart;
      let introRunning = false;

      for (let i = 0; i < count; i++) {
        const p = i * STRIDE;
        if (elapsed !== null && introStep(p, elapsed)) {
          introRunning = true;
          moving = true;
        } else if (physicsStep(p)) {
          moving = true;
        }
        ctx!.fillRect(
          particles[X + p] - dotSize / 2,
          particles[Y + p] - dotSize / 2,
          dotSize,
          dotSize,
        );
      }

      if (!introRunning) introStart = null;
      return !moving && !pointer.active;
    }

    // La boucle s'arrête d'elle-même quand tout est immobile (économie de batterie)
    // et redémarre au moindre mouvement de souris.
    function loop(now: number) {
      frame = 0;
      if (disposed || !visible) return;
      const settled = step(now);
      if (!settled) frame = requestAnimationFrame(loop);
    }
    function start() {
      if (!frame && visible && !disposed) frame = requestAnimationFrame(loop);
    }

    function onPointerMove(event: PointerEvent) {
      if (!visible) return;
      const rect = canvas!.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active =
        pointer.x >= 0 && pointer.y >= 0 && pointer.x <= width && pointer.y <= height;
      start();
    }

    function onPointerLeave() {
      pointer.active = false;
      start();
    }

    const resizeObserver = new ResizeObserver(() => {
      // layout() modifie la hauteur du conteneur, donc celle de la section : on ignore
      // les notifications qui ne changent rien pour ne pas boucler.
      if (
        container.clientWidth === textWidth &&
        canvas.clientWidth === width &&
        canvas.clientHeight === height
      ) {
        return;
      }
      introStart = null;
      layout(false);
      start();
    });

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });

    // Changement de thème : la classe de <html> change, on relit la couleur.
    const themeObserver = new MutationObserver(() => {
      readColor();
      if (!frame) step(performance.now());
    });

    // La police doit être chargée avant de dessiner le texte hors écran.
    document.fonts.ready.then(() => {
      if (disposed) return;
      readColor();
      layout(true);
      if (!reduceMotion) introStart = performance.now();
      step(performance.now()); // premier rendu immédiat : particules éparpillées
      setReady(true);
      start();

      resizeObserver.observe(container);
      resizeObserver.observe(canvas);
      intersectionObserver.observe(canvas);
      themeObserver.observe(document.documentElement, { attributeFilter: ["class"] });
      if (!reduceMotion) {
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onPointerLeave);
      }
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [text]);

  return (
    <div
      ref={containerRef}
      // Place réservée avant le premier rendu du canvas, pour éviter un saut de mise en page.
      className={cn(!ready && "min-h-44 sm:min-h-40", className)}
    >
      <h1 className="sr-only">{text}</h1>
      <noscript>
        <p
          aria-hidden="true"
          className="text-5xl font-semibold tracking-tight text-primary sm:text-7xl"
        >
          {text}
        </p>
      </noscript>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn(
          // Couvre la section du hero (premier ancêtre positionné) ; les clics passent au travers.
          "pointer-events-none absolute inset-0 size-full font-sans text-primary transition-opacity duration-500",
          ready ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
