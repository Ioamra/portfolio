"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GalleryImage = { id: string; src: string; alt: string };

/**
 * Carrousel des images d'un projet.
 * Repose sur le défilement natif avec « scroll snap » : glisser au doigt, molette et
 * clavier fonctionnent sans code ; les boutons et les points ne font que piloter le défilement.
 */
export function ProjectGallery({ images }: { images: GalleryImage[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  // L'image courante est celle qui occupe le plus le cadre visible.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || images.length < 2) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCurrent(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { root: track, threshold: 0.6 },
    );
    for (const slide of track.children) observer.observe(slide);
    return () => observer.disconnect();
  }, [images.length]);

  function goTo(index: number) {
    const track = trackRef.current;
    const target = (index + images.length) % images.length;
    track?.children[target]?.scrollIntoView({ block: "nearest", inline: "start" });
  }

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={images[0].src} alt={images[0].alt} className="w-full rounded-xl border" />
    );
  }

  return (
    <section aria-roledescription="carrousel" aria-label="Captures d'écran" className="space-y-3">
      <div className="relative">
        <div
          ref={trackRef}
          tabIndex={0}
          aria-label="Images du projet (faire défiler avec les flèches du clavier)"
          className="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto scroll-smooth rounded-xl border focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
          onKeyDown={(event) => {
            if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
            // Le défilement natif des flèches se cumulerait avec goTo() : on le désactive.
            event.preventDefault();
            goTo(event.key === "ArrowRight" ? current + 1 : current - 1);
          }}
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              data-index={index}
              role="group"
              aria-roledescription="diapositive"
              aria-label={`${index + 1} sur ${images.length}`}
              // Cadre 16:9 fixe : toutes les diapositives ont la même hauteur, quel que soit le format.
              className="flex aspect-video w-full shrink-0 snap-start items-center justify-center bg-muted/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.alt}
                loading={index === 0 ? "eager" : "lazy"}
                className="size-full object-contain"
              />
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          aria-label="Image précédente"
          onClick={() => goTo(current - 1)}
          className="absolute top-1/2 left-3 -translate-y-1/2 bg-background/80"
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Image suivante"
          onClick={() => goTo(current + 1)}
          className="absolute top-1/2 right-3 -translate-y-1/2 bg-background/80"
        >
          <ChevronRightIcon />
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="min-w-0 truncate text-sm text-muted-foreground">{images[current]?.alt}</p>
        <div className="flex shrink-0 gap-1.5">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Afficher l'image ${index + 1}`}
              aria-current={index === current ? "true" : undefined}
              onClick={() => goTo(index)}
              className={cn(
                "size-2.5 rounded-full transition-colors",
                index === current
                  ? "bg-primary"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/60",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
