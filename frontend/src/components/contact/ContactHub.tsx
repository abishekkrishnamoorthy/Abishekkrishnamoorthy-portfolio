"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AtSign, BriefcaseBusiness, CalendarDays, CheckCircle2, Code2, FileText, LinkIcon, Loader2, Mail, MessageSquare, Phone, Send, UserRound, Video, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/common/Button";
import { useSubmitContactMessage, useSubmitMeetingRequest } from "@/hooks/useContact";
import { ApiError } from "@/types/common.types";
import type { CommunicationMethod, ContactContent, ContactMessagePayload, MeetingRequestPayload, MeetingType } from "@/types/contact.types";

type FormData = MeetingRequestPayload;
type ValidationErrors = Partial<Record<keyof FormData, string>>;
type SubmissionState = "idle" | "loading" | "success";

const initialFormData: FormData = {
  meetingType: "phone",
  fullName: "",
  email: "",
  phone: "",
  preferredDate: "",
  preferredTime: "",
  timezone: "Asia/Kolkata",
  purpose: "",
  message: "",
};

export function ContactHub({ content }: { content: ContactContent }) {
  const [selectedMeetingType, setSelectedMeetingType] = useState<MeetingType | null>(null);

  return (
    <main>
      <ContactHero content={content} onSchedule={setSelectedMeetingType} />
      <CommunicationOptions methods={content.communicationMethods.filter((method) => method.visible)} onSelect={setSelectedMeetingType} />
      <ContactForm />
      <SocialLinks content={content} />
      <SchedulingModal meetingType={selectedMeetingType} onClose={() => setSelectedMeetingType(null)} />
    </main>
  );
}

function ContactHero({ content, onSchedule }: { content: ContactContent; onSchedule: (type: MeetingType) => void }) {
  return (
    <section className="section-container text-center">
      <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-gold)]">Contact</p>
      <h1 className="mx-auto max-w-3xl text-[34px] font-bold leading-10 text-white md:text-[56px] md:leading-[68px]">{content.hero.title}</h1>
      <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">{content.hero.description}</p>
      <div className="mt-9 flex flex-wrap justify-center gap-4">
        <Button icon={<CalendarDays className="h-4 w-4" />} onClick={() => onSchedule("meet")}>
          Schedule a Call
        </Button>
        <Button variant="secondary" icon={<MessageSquare className="h-4 w-4" />} href="#contact-form">
          Send a Message
        </Button>
      </div>
    </section>
  );
}

function CommunicationOptions({ methods, onSelect }: { methods: CommunicationMethod[]; onSelect: (type: MeetingType) => void }) {
  return (
    <section className="section-container pt-0">
      <div className="grid gap-6 md:grid-cols-2">
        {methods.map((method) => <CommunicationCard key={method.id} icon={method.type === "phone" ? <Phone className="h-6 w-6" /> : <Video className="h-6 w-6" />} title={method.title} description={method.description} duration={method.duration} action={method.actionLabel} onClick={() => onSelect(method.type)} />)}
      </div>
    </section>
  );
}

function CommunicationCard({ icon, title, description, duration, action, onClick }: { icon: ReactNode; title: string; description: string; duration: string; action: string; onClick: () => void }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 transition hover:-translate-y-1 hover:border-[rgba(212,175,55,0.36)] hover:shadow-[0_24px_54px_rgba(0,0,0,0.22)] motion-reduce:hover:translate-y-0"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.08)] text-[var(--accent-gold)]">{icon}</div>
      <h2 className="mt-6 text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">{description}</p>
      <div className="mt-6 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--bg-surface-alt)] p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Estimated Duration</p>
        <p className="mt-1 font-semibold text-white">{duration}</p>
      </div>
      <Button className="mt-6 w-full" icon={<CalendarDays className="h-4 w-4" />} onClick={onClick}>
        {action}
      </Button>
    </motion.article>
  );
}

function SchedulingModal({ meetingType, onClose }: { meetingType: MeetingType | null; onClose: () => void }) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [submissionError, setSubmissionError] = useState<string>();
  const submitMeeting = useSubmitMeetingRequest();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!meetingType) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setFormData({ ...initialFormData, meetingType });
    setValidationErrors({});
    setSubmissionState("idle");
    setSubmissionError(undefined);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [meetingType, onClose]);

  const meetingLabel = formData.meetingType === "phone" ? "Phone Call" : "Google Meet";
  const isLoading = submissionState === "loading";

  const update = (field: keyof FormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setValidationErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateMeetingRequest(formData);
    setValidationErrors(errors);
    if (Object.keys(errors).length) return;

    setSubmissionState("loading");
    setSubmissionError(undefined);
    try {
      await submitMeeting.mutateAsync(formData);
      setSubmissionState("success");
    } catch (error) {
      setSubmissionState("idle");
      setSubmissionError(error instanceof ApiError ? error.message : "Unable to submit the meeting request.");
    }
  };

  return (
    <AnimatePresence>
      {meetingType ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 p-0 backdrop-blur-xl md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            className="flex h-dvh w-full flex-col overflow-hidden border border-[rgba(255,255,255,0.08)] bg-[rgba(11,11,15,0.96)] shadow-[0_32px_100px_rgba(0,0,0,0.68)] md:h-auto md:max-h-[88dvh] md:max-w-2xl md:rounded-[24px]"
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-5 border-b border-[rgba(255,255,255,0.06)] px-5 py-5 md:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-gold)]">Meeting request</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{submissionState === "success" ? "Meeting Request Submitted" : meetingLabel}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Meeting requests are reviewed before confirmation.</p>
              </div>
              <button type="button" aria-label="Close scheduling modal" className="rounded-full border border-[rgba(255,255,255,0.08)] p-2 text-[var(--text-secondary)] transition hover:text-white" onClick={onClose}>
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="custom-scrollbar overflow-y-auto px-5 py-5 md:px-6">
              {submissionState === "success" ? (
                <SuccessState meetingType={formData.meetingType} onClose={onClose} />
              ) : (
                <form onSubmit={submit} className="grid gap-5">
                  <div>
                    <p className="mb-3 text-sm font-medium text-white">Meeting Type</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <MeetingTypeButton active={formData.meetingType === "phone"} icon={<Phone className="h-4 w-4" />} label="Phone Call" onClick={() => update("meetingType", "phone")} />
                      <MeetingTypeButton active={formData.meetingType === "meet"} icon={<Video className="h-4 w-4" />} label="Google Meet" onClick={() => update("meetingType", "meet")} />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <ModalField label="Full Name *" value={formData.fullName} error={validationErrors.fullName} onChange={(value) => update("fullName", value)} />
                    <ModalField label="Preferred Date *" value={formData.preferredDate} error={validationErrors.preferredDate} type="date" onChange={(value) => update("preferredDate", value)} />
                    <ModalField label="Preferred Time *" value={formData.preferredTime} error={validationErrors.preferredTime} type="time" onChange={(value) => update("preferredTime", value)} />
                    <ModalField label="Timezone *" value={formData.timezone} error={validationErrors.timezone} onChange={(value) => update("timezone", value)} />
                    {formData.meetingType === "phone" ? (
                      <>
                        <ModalField label="Phone Number *" value={formData.phone ?? ""} error={validationErrors.phone} onChange={(value) => update("phone", value)} />
                        <ModalField label="Email (Optional)" value={formData.email ?? ""} error={validationErrors.email} type="email" onChange={(value) => update("email", value)} />
                      </>
                    ) : (
                      <>
                        <ModalField label="Email Address *" value={formData.email ?? ""} error={validationErrors.email} type="email" onChange={(value) => update("email", value)} />
                        <ModalField label="Phone Number (Optional)" value={formData.phone ?? ""} error={validationErrors.phone} onChange={(value) => update("phone", value)} />
                      </>
                    )}
                  </div>

                  <ModalField label="Purpose of Meeting *" value={formData.purpose} error={validationErrors.purpose} onChange={(value) => update("purpose", value)} />
                  <ModalTextarea label="Optional Message" value={formData.message ?? ""} onChange={(value) => update("message", value)} />

                  <p className="rounded-2xl border border-[rgba(212,175,55,0.18)] bg-[rgba(212,175,55,0.06)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
                    {formData.meetingType === "phone"
                      ? "We'll call you at the provided phone number after your request is approved."
                      : "If the meeting request is accepted, the Google Meet invitation will be sent to your email."}
                  </p>
                  {submissionError ? <p role="alert" className="text-sm text-red-300">{submissionError}</p> : null}

                  <Button type="submit" disabled={isLoading} icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}>
                    {isLoading ? "Submitting..." : formData.meetingType === "phone" ? "Request Phone Call" : "Request Google Meet"}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function MeetingTypeButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" className={`flex min-h-12 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition ${active ? "border-[rgba(212,175,55,0.48)] bg-[rgba(212,175,55,0.1)] text-[var(--accent-gold)]" : "border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] text-white"}`} onClick={onClick}>
      {icon}
      {label}
    </button>
  );
}

function ModalField({ label, value, onChange, error, type = "text" }: { label: string; value: string; onChange: (value: string) => void; error?: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white">{label}</span>
      <input value={value} type={type} onChange={(event) => onChange(event.target.value)} className="min-h-12 w-full rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] px-4 text-sm text-white outline-none transition focus:border-[rgba(212,175,55,0.52)]" />
      {error ? <span className="mt-2 block text-xs text-red-300">{error}</span> : null}
    </label>
  );
}

function ModalTextarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white">{label}</span>
      <textarea value={value} rows={4} onChange={(event) => onChange(event.target.value)} className="w-full resize-none rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-[rgba(212,175,55,0.52)]" />
    </label>
  );
}

function SuccessState({ meetingType, onClose }: { meetingType: MeetingType; onClose: () => void }) {
  return (
    <div className="py-8 text-center">
      <motion.div initial={{ scale: 0.86, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(74,222,128,0.25)] bg-[rgba(74,222,128,0.08)] text-[var(--status-success)]">
        <CheckCircle2 className="h-8 w-8" />
      </motion.div>
      <h3 className="mt-6 text-2xl font-semibold text-white">Meeting Request Submitted</h3>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--text-secondary)]">
        Thanks for reaching out. Your request has been received. I&apos;ll review your availability before confirming the meeting.
      </p>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--text-secondary)]">
        {meetingType === "phone" ? "If approved, I'll contact you using your provided phone number." : "If approved, a Google Meet invitation will be sent to your email."}
      </p>
      <Button className="mt-7" onClick={onClose}>
        Return to Contact
      </Button>
    </div>
  );
}

function ContactForm() {
  const [formData, setFormData] = useState<ContactMessagePayload>({ name: "", email: "", subject: "", message: "", source: "portfolio-contact-page" });
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string>();
  const mutation = useSubmitContactMessage();

  const update = (field: keyof ContactMessagePayload, value: string) => setFormData((current) => ({ ...current, [field]: value }));
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmissionError(undefined);
    try {
      await mutation.mutateAsync(formData);
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "", source: "portfolio-contact-page" });
    } catch (error) {
      setSubmissionError(error instanceof ApiError ? error.message : "Unable to send your message.");
    }
  };

  return (
    <section id="contact-form" className="section-container pt-0">
      <form className="mx-auto max-w-3xl rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 md:p-6" onSubmit={submit}>
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-gold)]">Message</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Send a message</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">For visitors who don&apos;t need a meeting.</p>
        </div>
        <div className="grid gap-4">
          <InputField icon={<UserRound className="h-4 w-4" />} label="Name" placeholder="Your name" value={formData.name} onChange={(value) => update("name", value)} />
          <InputField icon={<AtSign className="h-4 w-4" />} label="Email" placeholder="you@example.com" type="email" value={formData.email} onChange={(value) => update("email", value)} />
          <InputField icon={<MessageSquare className="h-4 w-4" />} label="Subject" placeholder="Job opportunity, project, collaboration..." value={formData.subject} onChange={(value) => update("subject", value)} />
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">Message</span>
            <span className="flex rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] px-4 py-3 transition focus-within:border-[rgba(212,175,55,0.52)] focus-within:shadow-[0_0_0_3px_rgba(212,175,55,0.08)]">
              <textarea required minLength={20} value={formData.message} onChange={(event) => update("message", event.target.value)} rows={7} placeholder="Tell me a little about what you are building, hiring for, or exploring..." className="min-h-40 w-full resize-none bg-transparent text-[15px] leading-7 text-white outline-none placeholder:text-[var(--text-muted)]" />
            </span>
          </label>
        </div>
        {submissionError ? <p role="alert" className="mt-4 text-sm text-red-300">{submissionError}</p> : null}
        {submitted ? <p role="status" className="mt-4 text-sm text-[var(--status-success)]">Message received.</p> : null}
        <Button className="mt-6 w-full md:w-auto" type="submit" disabled={mutation.isPending} icon={mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}>
          {mutation.isPending ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </section>
  );
}

function InputField({ icon, label, placeholder, value, onChange, type = "text" }: { icon: ReactNode; label: string; placeholder: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white">{label}</span>
      <span className="flex min-h-14 items-center gap-3 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] px-4 transition focus-within:border-[rgba(212,175,55,0.52)] focus-within:shadow-[0_0_0_3px_rgba(212,175,55,0.08)]">
        <span className="text-[var(--accent-gold)]">{icon}</span>
        <input required value={value} onChange={(event) => onChange(event.target.value)} type={type} placeholder={placeholder} className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-[var(--text-muted)]" />
      </span>
    </label>
  );
}

function SocialLinks({ content }: { content: ContactContent }) {
  const cards = [
    ...content.socialLinks.filter((link) => link.visible && link.profileUrl).sort((a, b) => a.displayOrder - b.displayOrder).map((link) => ({ title: link.platform, value: link.username ?? link.profileUrl!, href: link.profileUrl!, icon: socialIcon(link.platform) })),
    ...(content.contact.email.visible && content.contact.email.href ? [{ title: content.contact.email.label, value: content.contact.email.value, href: content.contact.email.href, icon: <Mail key="email" className="h-5 w-5" /> }] : []),
    ...(content.contact.resume?.visible && content.contact.resume.href ? [{ title: content.contact.resume.label, value: content.contact.resume.value, href: content.contact.resume.href, icon: <FileText key="resume" className="h-5 w-5" /> }] : []),
  ];

  return (
    <section className="section-container pt-0">
      <div className="mb-8 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-gold)]">Social Links</p>
        <h2 className="text-[24px] font-bold text-white md:text-[32px]">Find me around the web.</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <a key={card.title} href={card.href} target={card.href.startsWith("http") ? "_blank" : undefined} rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined} className="group flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 transition hover:-translate-y-1 hover:border-[rgba(212,175,55,0.36)] motion-reduce:hover:translate-y-0">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgba(212,175,55,0.18)] bg-[rgba(212,175,55,0.08)] text-[var(--accent-gold)]">{card.icon}</span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-white">{card.title}</span>
              <span className="mt-1 block truncate text-sm text-[var(--text-secondary)]">{card.value}</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function socialIcon(platform: string) {
  if (platform === "GitHub") return <Code2 className="h-5 w-5" />;
  if (platform === "LinkedIn") return <BriefcaseBusiness className="h-5 w-5" />;
  return <LinkIcon className="h-5 w-5" />;
}

function validateMeetingRequest(data: FormData): ValidationErrors {
  const errors: ValidationErrors = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = data.preferredDate ? new Date(`${data.preferredDate}T00:00:00`) : null;

  if (!data.fullName.trim()) errors.fullName = "Full name is required.";
  if (!data.preferredDate) errors.preferredDate = "Preferred date is required.";
  else if (selectedDate && selectedDate < today) errors.preferredDate = "Date cannot be in the past.";
  if (!data.preferredTime) errors.preferredTime = "Preferred time is required.";
  if (!data.timezone.trim()) errors.timezone = "Timezone is required.";
  if (!data.purpose.trim()) errors.purpose = "Purpose is required.";

  if (data.meetingType === "phone") {
    if (!data.phone?.trim()) errors.phone = "Phone number is required.";
    else if (!/^[+\d][\d\s().-]{7,}$/.test(data.phone)) errors.phone = "Enter a valid phone number.";
    if (data.email && !isValidEmail(data.email)) errors.email = "Enter a valid email.";
  } else {
    if (!data.email?.trim()) errors.email = "Email address is required.";
    else if (!isValidEmail(data.email)) errors.email = "Enter a valid email.";
    if (data.phone && !/^[+\d][\d\s().-]{7,}$/.test(data.phone)) errors.phone = "Enter a valid phone number.";
  }

  return errors;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
