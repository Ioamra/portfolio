import { MailOpenIcon, MailIcon, ReplyIcon, Trash2Icon } from "lucide-react";
import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deleteMessageAction, setMessageReadAction } from "@/server/actions/admin/message.action";
import { listContactMessages } from "@/server/services/contact.service";

export const metadata: Metadata = { title: "Messages" };

// Page admin : données lues à chaque requête, navigation non instantanée assumée.
export const instant = false;

export default async function AdminMessagesPage() {
  const messages = await listContactMessages();
  const unread = messages.filter((message) => !message.readAt).length;

  return (
    <>
      <AdminPageHeader
        title="Messages"
        description={`${messages.length} message(s), dont ${unread} non lu(s). Chaque message est aussi envoyé par e-mail.`}
      />
      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun message pour l&apos;instant.</p>
      ) : (
        <ul className="space-y-4">
          {messages.map((message) => {
            const read = Boolean(message.readAt);
            const replyHref = `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`;
            return (
              <li
                key={message.id}
                className={cn("rounded-xl border p-5", !read && "border-primary/40 bg-primary/5")}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {message.subject} {!read && <Badge className="ml-1">Non lu</Badge>}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {message.name} · {message.email}
                    </p>
                  </div>
                  <time
                    dateTime={message.createdAt.toISOString()}
                    className="text-xs text-muted-foreground"
                  >
                    {formatDateTime(message.createdAt)}
                  </time>
                </div>
                <p className="mt-4 text-sm whitespace-pre-wrap">{message.message}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={replyHref}
                    className="inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-[0.8rem] font-medium hover:bg-muted"
                  >
                    <ReplyIcon className="size-3.5" aria-hidden="true" />
                    Répondre
                  </a>
                  <ConfirmActionButton
                    action={setMessageReadAction.bind(null, message.id, !read)}
                    variant="ghost"
                    size="sm"
                  >
                    {read ? (
                      <MailIcon data-icon="inline-start" />
                    ) : (
                      <MailOpenIcon data-icon="inline-start" />
                    )}
                    {read ? "Marquer non lu" : "Marquer lu"}
                  </ConfirmActionButton>
                  <ConfirmActionButton
                    action={deleteMessageAction.bind(null, message.id)}
                    confirmMessage="Supprimer ce message ?"
                    variant="ghost"
                    size="sm"
                  >
                    <Trash2Icon data-icon="inline-start" />
                    Supprimer
                  </ConfirmActionButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
