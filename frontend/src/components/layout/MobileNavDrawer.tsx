"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/components/common/Button";
import { navigationLinks } from "@/constants/navigation";
import { useNavigation } from "@/context/NavigationContext";
import type { Profile } from "@/types/profile.types";

export function MobileNavDrawer({ profile }: { profile?: Profile }) {
  const { isMobileOpen, closeMobileNav, openAssistant } = useNavigation();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMobileOpen) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobileNav();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMobileNav, isMobileOpen]);

  return (
    <AnimatePresence>
      {isMobileOpen ? (
        <>
          <motion.button aria-label="Close navigation overlay" className="fixed inset-0 z-40 bg-black/60 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeMobileNav} />
          <motion.aside
            aria-label="Mobile navigation"
            className="fixed right-0 top-0 z-50 flex h-dvh w-[min(86vw,360px)] flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-base)] p-6 md:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <button ref={closeRef} aria-label="Close navigation" className="ml-auto text-[var(--text-secondary)] hover:text-white" onClick={closeMobileNav}>
              <X className="h-5 w-5" />
            </button>
            <nav className="mt-10 flex flex-col gap-5">
              {navigationLinks.map((link) => (
                <Link key={link.label} href={link.href} onClick={closeMobileNav} className="text-lg font-medium text-white">
                  {link.label}
                </Link>
              ))}
            </nav>
            <Button className="mt-8" variant="secondary" onClick={() => {
              closeMobileNav();
              openAssistant();
            }}>
              Ask AI About Me
            </Button>
            {profile?.resumeUrl ? <Button className="mt-8" href={profile.resumeUrl} external variant="primary">Download Resume</Button> : null}
            <p className="mt-auto text-sm leading-6 text-[var(--text-muted)]">Use the Contact page for messages, scheduling, and social profiles.</p>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
