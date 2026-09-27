import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  /** Petit libellé au-dessus du titre, en police mono. */
  eyebrow?: string;
  title: string;
  description?: string;
  /** h1 pour le titre de page, h2 pour une section. */
  as?: "h1" | "h2";
  /** id du titre, pour aria-labelledby. */
  id?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  as: Heading = "h2",
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {eyebrow && (
        <p className="font-mono text-xs tracking-widest text-primary uppercase">{eyebrow}</p>
      )}
      <Heading
        id={id}
        className={cn(
          "font-semibold tracking-tight",
          Heading === "h1" ? "text-3xl sm:text-4xl" : "text-2xl",
        )}
      >
        {title}
      </Heading>
      {description && <p className="max-w-2xl text-muted-foreground">{description}</p>}
    </div>
  );
}
