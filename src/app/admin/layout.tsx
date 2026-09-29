import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s | Administration" },
  // Le back-office ne doit pas apparaître dans les moteurs de recherche.
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
