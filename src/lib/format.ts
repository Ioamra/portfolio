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
