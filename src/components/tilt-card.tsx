"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type TiltCardProps = {
  children: React.ReactNode;
  className?: string;
  /** Inclinaison maximale en degrés. */
  maxTilt?: number;
};

/**
 * Carte qui s'oriente vers la souris, où qu'elle soit dans la fenêtre : l'inclinaison
 * dépend de la position du curseur par rapport au centre de la carte. Un reflet suit
 * le curseur au survol. Les enfants peuvent ressortir en relief avec [transform:translateZ(..)].
 * Désactivé au tactile et si l'utilisateur a demandé à réduire les animations.
 */
export function TiltCard({ children, className, maxTilt = 6 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let visible = false;
    let frame = 0;
    const pointer = { x: 0, y: 0 };

    // Les valeurs passent par des variables CSS : pas de re-rendu React à chaque mouvement.
    function setTilt(rx: number, ry: number, gx = 50, gy = 50) {
      element!.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      element!.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      element!.style.setProperty("--gx", `${gx.toFixed(1)}%`);
      element!.style.setProperty("--gy", `${gy.toFixed(1)}%`);
    }

    function update() {
      frame = 0;
      const rect = element!.getBoundingClientRect();
      // Distance au centre, normalisée par une demi-fenêtre et bornée à [-1, 1].
      const clamp = (value: number) => Math.max(-1, Math.min(1, value));
      const nx = clamp((pointer.x - (rect.left + rect.width / 2)) / (window.innerWidth / 2));
      const ny = clamp((pointer.y - (rect.top + rect.height / 2)) / (window.innerHeight / 2));
      const gx = ((pointer.x - rect.left) / rect.width) * 100;
      const gy = ((pointer.y - rect.top) / rect.height) * 100;
      setTilt(-ny * maxTilt, nx * maxTilt, gx, gy);
    }

    function onPointerMove(event: PointerEvent) {
      if (event.pointerType !== "mouse" || !visible) return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      // Au plus une mise à jour par image, même si la souris envoie plus d'événements.
      if (!frame) frame = requestAnimationFrame(update);
    }

    function reset() {
      setTilt(0, 0);
    }

    // Seules les cartes visibles à l'écran réagissent.
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(element);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", reset);
    };
  }, [maxTilt]);

  return (
    <div
      ref={ref}
      className={cn(
        "group/tilt relative [transform:perspective(1000px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] transition-transform duration-300 ease-out [transform-style:preserve-3d] motion-reduce:[transform:none]",
        className,
      )}
    >
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_var(--gx,50%)_var(--gy,50%),color-mix(in_oklch,var(--primary)_16%,transparent),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100 motion-reduce:hidden"
      />
    </div>
  );
}
