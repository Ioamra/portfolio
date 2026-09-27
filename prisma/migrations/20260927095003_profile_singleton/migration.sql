-- Garantit qu'il n'existe qu'une seule ligne de profil.
-- Contrainte non exprimable dans le schéma Prisma, ajoutée à la main.
ALTER TABLE "profile" ADD CONSTRAINT "profile_singleton" CHECK ("id" = 1);
