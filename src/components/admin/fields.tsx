import { cn } from "@/lib/utils";

// Champs natifs stylés comme les composants shadcn (Input) : un <select> natif reste le
// plus accessible et suffit largement pour un back-office.

const fieldClass =
  "w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30";

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  // Fond et options explicites : sinon la liste native de l'OS (fond clair) reprend le
  // texte clair du thème sombre et devient illisible.
  return (
    <select
      className={cn(
        fieldClass,
        "h-8 bg-background [&_option]:bg-popover [&_option]:text-popover-foreground",
        className,
      )}
      {...props}
    />
  );
}

type CheckboxProps = Omit<React.ComponentProps<"input">, "type"> & { label: string };

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-2 text-sm", className)}>
      <input type="checkbox" className="size-4 accent-primary" {...props} />
      {label}
    </label>
  );
}

type SkillPickerProps = {
  skills: { id: string; name: string; category: string }[];
  selectedIds: string[];
  categoryLabels: Record<string, string>;
};

/** Cases à cocher des compétences, groupées par catégorie (name="skillIds"). */
export function SkillPicker({ skills, selectedIds, categoryLabels }: SkillPickerProps) {
  const categories = [...new Set(skills.map((skill) => skill.category))];

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">Compétences</legend>
      {categories.map((category) => (
        <div key={category}>
          <p className="mb-1.5 text-xs text-muted-foreground">{categoryLabels[category]}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {skills
              .filter((skill) => skill.category === category)
              .map((skill) => (
                <Checkbox
                  key={skill.id}
                  name="skillIds"
                  value={skill.id}
                  defaultChecked={selectedIds.includes(skill.id)}
                  label={skill.name}
                />
              ))}
          </div>
        </div>
      ))}
    </fieldset>
  );
}
