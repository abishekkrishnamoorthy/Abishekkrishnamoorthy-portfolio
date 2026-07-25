"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Bot, ChevronLeft, ChevronRight, Download, Paperclip, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNavigation } from "@/context/NavigationContext";
import { useAssistant } from "@/hooks/useAssistant";
import { cn } from "@/lib/utils";
import { ApiError } from "@/types/common.types";
import type { Profile } from "@/types/profile.types";

type AssistantMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

export function AssistantModal({ profile }: { profile?: Profile }) {
  const { isAssistantOpen, closeAssistant } = useNavigation();
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isProfileCollapsed, setIsProfileCollapsed] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const assistant = useAssistant();

  useEffect(() => {
    if (!isAssistantOpen) return;

    previousActiveElement.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setMessages([]);
    setDraft("");
    setIsTyping(false);
    setIsProfileCollapsed(false);
    const timer = window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 40);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeAssistant();
        return;
      }

      if (event.key !== "Tab") return;

      const root = modalRef.current;
      if (!root) return;

      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("disabled") && element.tabIndex !== -1 && element.offsetParent !== null);

      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !root.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElement.current?.focus?.();
    };
  }, [closeAssistant, isAssistantOpen]);

  useEffect(() => {
    if (!isAssistantOpen) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isAssistantOpen, isTyping, messages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
  }, [draft]);

  const sendMessage = async (value: string) => {
    const content = value.trim();
    if (!content || isTyping) return;

    setMessages((current) => [...current, createMessage("user", content)]);
    setDraft("");
    setIsTyping(true);

    try {
      const response = await assistant.mutateAsync({ message: content });
      setMessages((current) => [...current, createMessage("assistant", response.message)]);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "The assistant is currently unavailable.";
      setMessages((current) => [...current, createMessage("assistant", message)]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isAssistantOpen ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-2 py-2 backdrop-blur-xl md:px-6 md:py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeAssistant();
          }}
        >
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="assistant-title"
              aria-describedby="assistant-description"
              className={cn(
                "relative flex h-[95dvh] w-[calc(100vw-16px)] max-w-[1100px] flex-col overflow-hidden rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[rgba(11,11,15,0.92)] shadow-[0_32px_100px_rgba(0,0,0,0.68)] backdrop-blur-2xl",
                "md:h-[82vh] md:w-[92vw]",
              )}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <header className="relative z-10 flex items-center justify-between gap-5 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(18,19,24,0.72)] px-5 py-4 backdrop-blur-xl md:px-7">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.08)] text-[var(--accent-gold)]">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h2 id="assistant-title" className="text-[18px] font-semibold leading-6 text-white md:text-[20px]">
                      Ask AI About Me
                    </h2>
                    <p id="assistant-description" className="mt-0.5 max-w-2xl text-xs leading-5 text-[var(--text-secondary)] md:text-[13px]">
                      Ask anything about my projects, experience, skills or career.
                    </p>
                  </div>
                </div>

                <button
                  ref={closeButtonRef}
                  type="button"
                  aria-label="Close assistant"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)] transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(212,175,55,0.32)] hover:bg-[rgba(255,255,255,0.06)] hover:text-white"
                  onClick={closeAssistant}
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
                <section
                  className="flex min-h-0 min-w-0 flex-1 flex-col transition-[flex-basis] duration-300 ease-out"
                  style={{ flexBasis: isProfileCollapsed ? "100%" : "70%" } as CSSProperties}
                >
                  <div className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-6 pt-5 scroll-smooth md:px-10 md:pb-7 md:pt-7">
                    {messages.map((message) => (
                      <div key={message.id}>
                        <MessageBubble message={message} />
                      </div>
                    ))}
                    {messages.length === 0 && !isTyping ? (
                      <div className="flex min-h-[180px] items-center justify-center px-6 py-8 text-center">
                        <div>
                          <p className="text-sm font-medium text-white/80">Start a conversation</p>
                          <p className="mt-2 text-sm text-[var(--text-muted)]">Ask a question about the portfolio.</p>
                        </div>
                      </div>
                    ) : null}
                    {isTyping ? <TypingBubble /> : null}
                    <div ref={endRef} />
                  </div>

                  <div className="shrink-0 bg-transparent px-4 pb-4 pt-0 md:px-10 md:pb-5">
                    <form
                      className="mx-auto max-w-[760px] rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(18,19,24,0.94)] p-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition duration-200 focus-within:border-[rgba(212,175,55,0.28)]"
                      onSubmit={(event) => {
                        event.preventDefault();
                        sendMessage(draft);
                      }}
                    >
                      <div className="flex items-end gap-2 md:gap-3">
                        <button
                          type="button"
                          disabled
                          aria-label="Attachment disabled"
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] opacity-45"
                        >
                          <Paperclip className="h-4 w-4" />
                        </button>
                        <label className="sr-only" htmlFor="assistant-input">
                          Ask me anything
                        </label>
                        <textarea
                          id="assistant-input"
                          ref={textareaRef}
                          rows={1}
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                              event.preventDefault();
                              sendMessage(draft);
                            }
                          }}
                          placeholder="Ask me anything..."
                          className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-1 py-2 text-[15px] leading-6 text-white placeholder:text-[var(--text-muted)] focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={!draft.trim() || isTyping}
                          aria-label="Send message"
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-gold)] text-black transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-gold-hover)] hover:shadow-[0_10px_24px_rgba(212,175,55,0.22)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                      </div>
                    </form>
                  </div>
                </section>

                <button
                  type="button"
                  aria-label={isProfileCollapsed ? "Show profile summary" : "Hide profile summary"}
                  className="absolute top-1/2 z-20 hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(18,19,24,0.96)] text-[var(--text-secondary)] shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition duration-200 hover:border-[rgba(212,175,55,0.28)] hover:text-white lg:flex"
                  style={{ left: isProfileCollapsed ? "100%" : "70%" }}
                  onClick={() => setIsProfileCollapsed((current) => !current)}
                >
                  {isProfileCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>

                <motion.aside
                  className="custom-scrollbar hidden min-h-0 shrink-0 overflow-x-hidden overflow-y-auto border-l border-[rgba(255,255,255,0.04)] bg-[rgba(18,19,24,0.42)] px-5 py-5 md:px-8 lg:block lg:px-7 lg:py-7"
                  style={{ width: isProfileCollapsed ? "0%" : "30%", paddingLeft: isProfileCollapsed ? 0 : undefined, paddingRight: isProfileCollapsed ? 0 : undefined }}
                  animate={{ opacity: isProfileCollapsed ? 0 : 1, x: isProfileCollapsed ? 32 : 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  aria-hidden={isProfileCollapsed}
                >
                  <div className="space-y-7">
                    <ProfileSection eyebrow="About">
                      {profile?.name ? <h3 className="text-[20px] font-semibold leading-7 text-white">{profile.name}</h3> : null}
                      {profile ? <p className="mt-4 max-w-[22rem] text-sm leading-6 text-[var(--text-secondary)]">{profile.headline} {profile.highlightedHeadline}</p> : null}
                    </ProfileSection>
                    {profile?.resumeUrl ? <ProfileSection eyebrow="Resume">
                      <a
                        href={profile.resumeUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[rgba(212,175,55,0.38)] px-5 py-3 text-sm font-medium text-[var(--accent-gold)] transition duration-200 hover:-translate-y-0.5 hover:bg-[rgba(212,175,55,0.08)] hover:shadow-[0_14px_34px_rgba(0,0,0,0.24)]"
                      >
                        <Download className="h-4 w-4" />
                        Download Resume
                      </a>
                    </ProfileSection> : null}
                  </div>
                </motion.aside>
              </div>

              <footer className="relative z-10 border-t border-[rgba(255,255,255,0.04)] bg-[rgba(11,11,15,0.78)] px-5 py-2 backdrop-blur-xl md:px-6">
                <p className="text-center text-[11px] leading-5 text-[var(--text-muted)]">
                  <span className="text-[var(--accent-gold)]">✨ Powered by AI</span> · Responses are generated from my portfolio knowledge base.
                </p>
              </footer>
            </motion.div>
          </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function MessageBubble({ message }: { message: AssistantMessage }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[min(100%,46rem)] rounded-[20px] border px-4 py-3 text-[15px] leading-7 shadow-[0_12px_30px_rgba(0,0,0,0.18)] md:px-5",
          isUser
            ? "border-[rgba(212,175,55,0.28)] bg-[rgba(212,175,55,0.16)] text-white"
            : "border-[rgba(255,255,255,0.08)] bg-[rgba(18,19,24,0.96)] text-[var(--text-secondary)]",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-3 last:mb-0 whitespace-pre-wrap">{children}</p>,
              ul: ({ children }) => <ul className="mb-3 space-y-2 pl-5 last:mb-0">{children}</ul>,
              ol: ({ children }) => <ol className="mb-3 list-decimal space-y-2 pl-5 last:mb-0">{children}</ol>,
              li: ({ children }) => <li className="marker:text-[var(--accent-gold)]">{children}</li>,
              a: ({ children, href }) => (
                <a href={href} className="text-[var(--accent-gold)] underline decoration-[rgba(212,175,55,0.35)] underline-offset-4 transition hover:text-[var(--accent-gold-hover)]" target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noreferrer noopener" : undefined}>
                  {children}
                </a>
              ),
              code: ({ children }) => <code className="rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.34)] px-1.5 py-0.5 font-mono text-[0.92em] text-[rgba(255,255,255,0.94)]">{children}</code>,
              pre: ({ children }) => (
                <pre className="mb-3 overflow-x-auto rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.4)] p-4 last:mb-0">
                  {children}
                </pre>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </motion.div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[rgba(18,19,24,0.96)] px-4 py-4 text-[var(--text-secondary)] shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-[bounce_1.2s_infinite] rounded-full bg-[var(--accent-gold)] [animation-delay:-0.2s]" />
          <span className="h-2.5 w-2.5 animate-[bounce_1.2s_infinite] rounded-full bg-[rgba(255,255,255,0.5)] [animation-delay:-0.1s]" />
          <span className="h-2.5 w-2.5 animate-[bounce_1.2s_infinite] rounded-full bg-[rgba(255,255,255,0.3)]" />
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return (
    <section>
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-gold)]">{eyebrow}</p>
      {children}
    </section>
  );
}

function createMessage(role: AssistantMessage["role"], content: string): AssistantMessage {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
  };
}
