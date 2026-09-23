"use client";

import { EmptyState, ErrorState } from "@/components/feedback/page-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { isRtlLocale } from "@/i18n/routing";
import { ApiError } from "@/lib/api/types";
import type { CreateMessageInput, Message } from "@/lib/api/types";
import { messagesApi, staffApi, teachersApi } from "@/lib/api/resources";
import { formatDate, formatPersonName } from "@/lib/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const messagesQueryKey = ["messages"] as const;

type PersonOption = {
  userId: string;
  label: string;
};

export function MessagesPage() {
  const t = useTranslations("messages");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const rtl = isRtlLocale(locale);
  const queryClient = useQueryClient();

  const [tab, setTab] = useState("inbox");
  const [composeOpen, setComposeOpen] = useState(false);
  const [viewing, setViewing] = useState<Message | null>(null);
  const [recipientId, setRecipientId] = useState("");
  const [manualRecipient, setManualRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const inboxQuery = useQuery({
    queryKey: [...messagesQueryKey, "inbox"],
    queryFn: () => messagesApi.inbox(),
  });

  const sentQuery = useQuery({
    queryKey: [...messagesQueryKey, "sent"],
    queryFn: () => messagesApi.sent(),
  });

  const staffQuery = useQuery({
    queryKey: ["staff", "people"],
    queryFn: () => staffApi.list({ page: 1, pageSize: 100 }),
    staleTime: 60_000,
    enabled: composeOpen,
  });

  const teachersQuery = useQuery({
    queryKey: ["teachers", "people"],
    queryFn: () => teachersApi.list({ page: 1, pageSize: 100 }),
    staleTime: 60_000,
    enabled: composeOpen,
  });

  const people = useMemo(() => {
    const map = new Map<string, PersonOption>();
    for (const member of staffQuery.data?.data ?? []) {
      if (!member.userId) continue;
      map.set(member.userId, {
        userId: member.userId,
        label: `${formatPersonName(member.firstName, member.lastName)} (${member.email})`,
      });
    }
    for (const teacher of teachersQuery.data?.data ?? []) {
      if (!teacher.userId || map.has(teacher.userId)) continue;
      map.set(teacher.userId, {
        userId: teacher.userId,
        label: `${formatPersonName(teacher.firstName, teacher.lastName)} (${teacher.email})`,
      });
    }
    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [staffQuery.data, teachersQuery.data]);

  const sendMutation = useMutation({
    mutationFn: (input: CreateMessageInput) => messagesApi.send(input),
    onSuccess: async () => {
      toast.success(t("toasts.sent"));
      setComposeOpen(false);
      setRecipientId("");
      setManualRecipient("");
      setSubject("");
      setBody("");
      await queryClient.invalidateQueries({ queryKey: messagesQueryKey });
      setTab("sent");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => messagesApi.markRead(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...messagesQueryKey, "inbox"],
      });
    },
  });

  function openMessage(message: Message, fromInbox: boolean) {
    setViewing(message);
    if (fromInbox && !message.readAt) {
      readMutation.mutate(message.id);
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const target = recipientId || manualRecipient.trim();
    if (!target || !body.trim()) {
      toast.error(t("errors.required"));
      return;
    }
    void sendMutation.mutateAsync({
      recipientId: target,
      subject: subject.trim() || undefined,
      body: body.trim(),
    });
  }

  const activeQuery = tab === "inbox" ? inboxQuery : sentQuery;
  const rows = activeQuery.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setRecipientId("");
            setManualRecipient("");
            setSubject("");
            setBody("");
            setComposeOpen(true);
          }}
        >
          <Plus className="size-4" />
          {t("compose")}
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="inbox">{t("tabs.inbox")}</TabsTrigger>
          <TabsTrigger value="sent">{t("tabs.sent")}</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          {activeQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : activeQuery.isError ? (
            <ErrorState
              message={
                activeQuery.error instanceof ApiError
                  ? activeQuery.error.message
                  : undefined
              }
              onRetry={() => void activeQuery.refetch()}
            />
          ) : rows.length === 0 ? (
            <EmptyState
              title={t("emptyTitle")}
              description={t("emptyDescription")}
            />
          ) : (
            <ul className="space-y-2">
              {rows.map((message) => {
                const peer =
                  tab === "inbox" ? message.sender : message.recipient;
                const unread = tab === "inbox" && !message.readAt;
                return (
                  <li key={message.id}>
                    <button
                      type="button"
                      className="flex w-full flex-col gap-1 rounded-xl border border-border bg-card p-4 text-start shadow-sm transition hover:border-primary/40"
                      onClick={() => openMessage(message, tab === "inbox")}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">
                          {peer
                            ? formatPersonName(peer.firstName, peer.lastName)
                            : tab === "inbox"
                              ? message.senderId
                              : message.recipientId}
                        </span>
                        {unread && (
                          <Badge
                            variant="outline"
                            className="rounded-full border-transparent bg-primary/15 text-primary"
                          >
                            {t("unread")}
                          </Badge>
                        )}
                        <span className="ms-auto text-xs text-muted-foreground">
                          {formatDate(message.createdAt, locale, {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-medium">
                        {message.subject || t("noSubject")}
                      </p>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {message.body}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      <Sheet
        open={Boolean(viewing)}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        <SheetContent
          side={rtl ? "left" : "right"}
          className="flex w-full flex-col sm:max-w-lg"
        >
          <SheetHeader>
            <SheetTitle>{viewing?.subject || t("noSubject")}</SheetTitle>
            <SheetDescription>
              {viewing
                ? formatDate(viewing.createdAt, locale, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : null}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <p className="whitespace-pre-wrap text-sm">{viewing?.body}</p>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={composeOpen} onOpenChange={setComposeOpen}>
        <SheetContent
          side={rtl ? "left" : "right"}
          className="flex w-full flex-col sm:max-w-lg"
        >
          <SheetHeader>
            <SheetTitle>{t("composeTitle")}</SheetTitle>
            <SheetDescription>{t("composeSubtitle")}</SheetDescription>
          </SheetHeader>
          <form
            className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4"
            onSubmit={handleSend}
          >
            <div className="flex-1 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <Label>{t("fields.recipient")}</Label>
                <Select
                  value={recipientId || undefined}
                  onValueChange={(v) => {
                    setRecipientId(v);
                    setManualRecipient("");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t("fields.recipientPlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {people.map((person) => (
                      <SelectItem key={person.userId} value={person.userId}>
                        {person.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="msg-manual">{t("fields.manualRecipient")}</Label>
                <Input
                  id="msg-manual"
                  value={manualRecipient}
                  onChange={(e) => {
                    setManualRecipient(e.target.value);
                    setRecipientId("");
                  }}
                  placeholder={t("fields.manualRecipientPlaceholder")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="msg-subject">{t("fields.subject")}</Label>
                <Input
                  id="msg-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="msg-body">{t("fields.body")}</Label>
                <Textarea
                  id="msg-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setComposeOpen(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={sendMutation.isPending}>
                {t("actions.send")}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
