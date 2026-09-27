import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SkillListProps = {
  skills: { id: string; name: string }[];
  className?: string;
};

export function SkillList({ skills, className }: SkillListProps) {
  if (skills.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Technologies">
      {skills.map((skill) => (
        <li key={skill.id}>
          <Badge variant="secondary">{skill.name}</Badge>
        </li>
      ))}
    </ul>
  );
}
