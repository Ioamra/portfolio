"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";

type ConfirmActionButtonProps = {
  /** Server Action déjà liée à ses arguments (ex. deleteSkillAction.bind(null, id)). */
  action: () => Promise<void>;
  /** Message de confirmation ; sans message, l'action est exécutée directement. */
  confirmMessage?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Button>, "onClick" | "action">;

/** Bouton qui exécute une Server Action, après confirmation si demandé. */
export function ConfirmActionButton({
  action,
  confirmMessage,
  children,
  disabled,
  ...buttonProps
}: ConfirmActionButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      disabled={disabled || pending}
      onClick={() => {
        if (confirmMessage && !window.confirm(confirmMessage)) return;
        startTransition(() => action());
      }}
      {...buttonProps}
    >
      {children}
    </Button>
  );
}
