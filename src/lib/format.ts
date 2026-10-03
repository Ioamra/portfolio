// Les dates @db.Date sont stockées à minuit UTC : on formate en UTC pour ne pas
// basculer sur le jour (ou le mois) précédent selon le fuseau du serveur.
const monthYear = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatMonthYear(date: Date) {
  return monthYear.format(date);
}

export function formatPeriod(start: Date, end: Date | null) {
  return `${formatMonthYear(start)} — ${end ? formatMonthYear(end) : "aujourd'hui"}`;
}

// Horodatages (messages) : affichés à l'heure de Paris, quel que soit le fuseau du serveur.
const dateTime = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

export function formatDateTime(date: Date) {
  return dateTime.format(date);
}

/** Valeur d'un <input type="month"> ("2024-09") à partir d'une date @db.Date. */
export function toMonthInputValue(date: Date | null) {
  return date ? date.toISOString().slice(0, 7) : "";
}

/** Tronque un texte à `max` caractères sur une fin de mot (meta description ≈ 160). */
export function excerpt(text: string, max = 160) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}
