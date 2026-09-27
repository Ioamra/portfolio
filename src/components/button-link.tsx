import type { VariantProps } from "class-variance-authority";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonLinkProps = React.ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>;

/**
 * Lien avec l'apparence d'un bouton. À préférer à <Button render={<Link />}> : Base UI
 * ajouterait role="button", et le lien serait annoncé comme un bouton aux lecteurs d'écran.
 */
export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
