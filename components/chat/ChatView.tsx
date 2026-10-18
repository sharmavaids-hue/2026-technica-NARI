"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { confirmCheckin, sendMessage } from "@/lib/actions/chat";
import { APP_TZ, diffDays, formatMonthDay } from "@/lib/date";
import type { ChatData, ChatMessage } from "@/lib/types";
import { Chip } from "@/components/ui/Chip";
import { GetHelpContent } from "@/components/ui/GetHelp";
import { SignalCard } from "@/components/ui/SignalCard";
import { Sphere } from "@/components/ui/Sphere";
import { ArrowUpIcon, PlusIcon } from "@/components/ui/icons";
import { BarsCard } from "./BarsCard";

// Clock time for a message timestamp. The *day* comes from appDate, so the demo skip works.
const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: APP_TZ });
const time = (iso: string) => timeFmt.format(new Date(iso));

function dayLabel(appDate: string, today: string) {
  const ago = diffDays(appDate, today);
  if (ago === 0) return "Today";
  if (ago === 1) return "Yesterday";
  return formatMonthDay(appDate).replace(/^\w/, (c) => c.toUpperCase());
}

/** Show a timestamp before the first message, a new day, or a gap of an hour+. */
function needsStamp(m: ChatMessage, prev: ChatMessage | undefined) {
  if (!prev) return true;
  if (m.appDate !== prev.appDate) return true;
  return Date.parse(m.createdAt) - Date.parse(prev.createdAt) > 60 * 60 * 1000;
}

function NariBubble({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[min(32rem,85%)] self-start whitespace-pre-line rounded-[22px] rounded-bl-[8px] bg-[#e6dfd3] px-4 py-2.5 text-ink [overflow-wrap:anywhere]">
      {children}
    </div>
  );
}

function UserBubble({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[min(32rem,85%)] self-end whitespace-pre-line rounded-[22px] rounded-br-[8px] bg-blue px-4 py-2.5 text-white [overflow-wrap:anywhere]">
      {children}
    </div>
  );
}

export function ChatView({ data }: { data: ChatData }) {
  const router = useRouter();
  const [chat, setChat] = useState(data);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const messages = chat.messages;
  const lastUser = messages.findLastIndex((m) => m.sender === "user");
  const readBy = lastUser >= 0 ? messages.slice(lastUser + 1).find((m) => m.sender === "nari") : undefined;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    endRef.current?.scrollIntoView({ block: "end", behavior: reduce ? "auto" : "smooth" });
  }, [messages.length, sending]);

  // the phone composer is fixed, so the thread's bottom padding follows its height
  useEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      rootRef.current?.style.setProperty("--composer-h", `${el.offsetHeight}px`);
      endRef.current?.scrollIntoView({ block: "end" });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** Grow the box with its text, up to ~6 lines, then scroll inside it. */
  function autosize() {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }

  function send(text: string) {
    const t = text.trim();
    if (!t || sending) return;
    if (t.toLowerCase() === "log a pad") {
      router.push("/app/pad");
      return;
    }
    setDraft("");
    requestAnimationFrame(autosize);
    setSending(t);
    startTransition(async () => {
      try {
        setChat(await sendMessage(t));
      } finally {
        setSending(null);
      }
    });
  }

  async function confirm(id: string, values: Parameters<typeof confirmCheckin>[1]) {
    setChat(await confirmCheckin(id, values));
  }

  function renderMessage(m: ChatMessage) {
    if (m.sender === "user") return <UserBubble>{m.body}</UserBubble>;
    const card = m.card;
    if (card?.type === "bars") {
      return (
        <div className="self-start">
          <BarsCard title={m.body} card={card} onConfirm={(v) => confirm(m.id, v)} />
        </div>
      );
    }
    if (card?.type === "signal") {
      return (
        <div className="flex w-full max-w-[min(32rem,90%)] flex-col gap-2 self-start">
          {m.body && <NariBubble>{m.body}</NariBubble>}
          <SignalCard signal={card.signal} level={2} />
        </div>
      );
    }
    if (card?.type === "get-help") {
      return (
        <section aria-label="get help now" className="on-dark flex w-full max-w-[min(32rem,90%)] flex-col gap-3 self-start rounded-[22px] bg-ink p-5 text-white">
          <p className="font-bold text-lg">{m.body}</p>
          <GetHelpContent compact />
        </section>
      );
    }
    return <NariBubble>{m.body}</NariBubble>;
  }

  return (
    <div ref={rootRef} className="flex flex-1 flex-col lg:h-dvh lg:min-h-0">
      <header className="flex flex-col items-center gap-1 border-b border-line px-4 pb-4 pt-2 text-center lg:pt-6">
        <Sphere size={58} />
        <h1 className="mt-1 font-bold text-lg">nari</h1>
        <p className="text-[0.95rem] text-muted">checks in once a day during your period</p>
      </header>

      <div className="flex-1 pb-[calc(var(--composer-h,9rem)+5.5rem)] lg:min-h-0 lg:overflow-y-auto lg:pb-6">
        <div role="log" aria-label="messages with nari" aria-live="polite" className="mx-auto flex w-full max-w-[46rem] flex-col gap-2 px-4 pt-6">
          {messages.map((m, i) => (
            <Fragment key={m.id}>
              {needsStamp(m, messages[i - 1]) && (
                <p className="mb-1 mt-4 text-center text-sm text-muted first:mt-0">
                  {dayLabel(m.appDate, chat.today)} {time(m.createdAt)}
                </p>
              )}
              {renderMessage(m)}
              {i === lastUser && !sending && (
                <p className="-mt-1 self-end pr-1 text-sm text-muted">
                  {readBy ? `Read ${time(readBy.createdAt)}` : "Delivered"}
                </p>
              )}
            </Fragment>
          ))}

          {sending && (
            <>
              <div aria-hidden="true" className="contents">
                <UserBubble>{sending}</UserBubble>
              </div>
              <div className="flex h-10 w-[4.25rem] items-center justify-center gap-1.5 self-start rounded-[20px] bg-[#e6dfd3]">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    aria-hidden="true"
                    className="size-2 rounded-full bg-muted"
                    style={{ animation: "typing 1.2s infinite", animationDelay: `${d * 0.15}s` }}
                  />
                ))}
                <span className="sr-only">nari is typing</span>
              </div>
            </>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div ref={composerRef} className="no-print fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-paper/95 backdrop-blur-sm lg:static lg:bg-transparent lg:backdrop-blur-none">
        <div className="mx-auto flex w-full max-w-[46rem] flex-col gap-3 px-4 py-3 lg:py-4">
          {!sending && chat.quickReplies.length > 0 && (
            <ul aria-label="quick replies" className="flex flex-wrap justify-end gap-2">
              {chat.quickReplies.map((q) => (
                <li key={q}>
                  <Chip onClick={() => send(q)}>{q}</Chip>
                </li>
              ))}
            </ul>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
              inputRef.current?.focus();
            }}
            className="flex items-end gap-2.5"
          >
            <Link
              href="/app/pad"
              aria-label="log a pad in pad check"
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#e6dfd3] text-ink hover:bg-[#ddd4c6]"
            >
              <PlusIcon size={20} strokeWidth={2.25} />
            </Link>
            <label htmlFor="chat-input" className="sr-only">
              message nari
            </label>
            <textarea
              ref={inputRef}
              id="chat-input"
              rows={1}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                autosize();
              }}
              onKeyDown={(e) => {
                // laptops: Enter sends, Shift+Enter is a new line. phones: Enter is a new line, the button sends.
                if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
                if (window.matchMedia("(pointer: coarse)").matches) return;
                e.preventDefault();
                send(draft);
              }}
              placeholder="Text message"
              autoComplete="off"
              enterKeyHint="enter"
              maxLength={1000}
              className="block max-h-[168px] min-h-12 min-w-0 flex-1 resize-none overflow-y-auto rounded-[24px] border-[1.5px] border-line bg-card px-5 py-[11px] text-base leading-6"
            />
            <button
              type="submit"
              aria-label="send"
              disabled={!draft.trim() || Boolean(sending)}
              className="btn-gloss flex size-12 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-45"
            >
              <ArrowUpIcon size={20} strokeWidth={2.25} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
