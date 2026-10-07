#!/bin/sh
# Démarrage du conteneur de production.
set -e

echo "[portfolio] Migrations de la base de données…"
npx prisma migrate deploy

# Premier démarrage uniquement : contenu initial (ne fait rien si la base contient déjà
# un profil, le contenu de production n'est donc jamais écrasé).
echo "[portfolio] Contenu initial (si base vide)…"
npx tsx prisma/seed.ts --if-empty

# Le build pré-rend les pages avec la base : il se fait ici, base accessible.
# Il est conservé tant que le conteneur n'est pas recréé (redémarrage, reboot) ;
# un déploiement d'une nouvelle image refait le build une fois.
if [ ! -f .next/BUILD_ID ]; then
  echo "[portfolio] Build Next.js (1 à 3 minutes)…"
  npx next build
fi

echo "[portfolio] Démarrage du serveur."
exec npx next start -p 3000
