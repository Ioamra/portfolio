import "server-only";
import nodemailer from "nodemailer";
import { env } from "./env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  // 465 = TLS direct ; les autres ports (587, 1025…) passent en STARTTLS si disponible.
  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
});

type ContactNotification = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

/**
 * Transmet un message du formulaire de contact à l'adresse du propriétaire.
 * Mail en texte brut uniquement : aucune donnée saisie n'est interprétée comme du HTML.
 * « Répondre » dans la messagerie répond directement à l'expéditeur (replyTo).
 */
export async function sendContactNotification(contact: ContactNotification) {
  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: env.MAIL_TO,
    replyTo: { name: contact.name, address: contact.email },
    subject: `[Portfolio] ${contact.subject}`,
    text: [
      `Nouveau message depuis le formulaire de contact.`,
      ``,
      `De : ${contact.name} <${contact.email}>`,
      `Sujet : ${contact.subject}`,
      ``,
      contact.message,
    ].join("\n"),
  });
}
