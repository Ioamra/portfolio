# Image de production du portfolio.
#
# Le build Next.js n'est PAS fait ici : avec Cache Components, `next build` pré-rend les
# pages à partir de la base de données, qui n'est pas accessible pendant `docker build`.
# Il est lancé au premier démarrage du conteneur (voir docker/entrypoint.sh).

FROM node:24-slim

# openssl : requis par le moteur de migrations de Prisma.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Dépendances d'abord : cette couche reste en cache tant que package*.json ne change pas.
# Le postinstall lance `prisma generate`, d'où la copie du schéma et de la config Prisma.
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
# prisma.config.ts exige DATABASE_URL, que `prisma generate` n'utilise pas : adresse factice,
# limitée à cette commande (la vraie est fournie au démarrage par docker-compose).
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npm ci

COPY . .
RUN chmod +x docker/entrypoint.sh

ENV NODE_ENV=production
EXPOSE 3000
ENTRYPOINT ["./docker/entrypoint.sh"]
