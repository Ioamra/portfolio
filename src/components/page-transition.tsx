import { ViewTransition } from "react";

/**
 * Fondu léger à l'entrée et à la sortie d'une page lors d'une navigation.
 * À placer dans chaque page.tsx (un layout persiste entre les navigations, ses
 * animations d'entrée/sortie ne se déclencheraient jamais). Styles dans globals.css.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  );
}
