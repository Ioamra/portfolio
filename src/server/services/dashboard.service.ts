import "server-only";
import { db } from "../db";

/** Compteurs du tableau de bord admin. */
export async function getDashboardStats() {
  const [projects, publishedProjects, experiences, skills, unreadMessages] = await Promise.all([
    db.project.count(),
    db.project.count({ where: { published: true } }),
    db.experience.count(),
    db.skill.count(),
    db.contactMessage.count({ where: { readAt: null } }),
  ]);
  return { projects, publishedProjects, experiences, skills, unreadMessages };
}
