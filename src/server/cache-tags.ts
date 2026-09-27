/**
 * Tags de cache des données publiques.
 * Les services de lecture étiquettent leurs résultats avec ces tags ; les mutations
 * de l'admin les invalident (updateTag) pour que le site public se mette à jour.
 */
export const CACHE_TAGS = {
  profile: "profile",
  projects: "projects",
  skills: "skills",
  experiences: "experiences",
} as const;
