"use client";

import { ArrowUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { navigationLinks } from "@/constants/navigation";
import type { Profile } from "@/types/profile.types";

export function Footer({ profile }: { profile?: Profile }) {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-base)]">
      <div className="mx-auto max-w-[1280px] px-4 py-14 md:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <Image src="/assets/branding/logo.png" alt="AK logo" width={42} height={42} />
              <span className="text-lg font-bold text-white">AK.</span>
            </div>
            {profile?.subheadline ? <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">{profile.subheadline}</p> : null}
          </div>
          <FooterColumn title="Navigation" links={navigationLinks.map(({ label, href }) => ({ label, href }))} />
          <FooterColumn title="Resources" links={[...(profile?.resumeUrl ? [{ label: "Resume", href: profile.resumeUrl }] : []), { label: "Featured Projects", href: "/projects" }]} />
          <FooterColumn title="Connect" links={[{ label: "Contact Me", href: "/contact" }, { label: "Schedule a Call", href: "/contact" }]} />
        </div>
        <div className="mt-12 flex items-center justify-between border-t border-[var(--border-subtle)] pt-6 text-sm text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} Abishek Krishnamoorthy. All rights reserved.</p>
          <button aria-label="Scroll to top" className="rounded-full border border-[var(--border-subtle)] p-2 text-[var(--text-secondary)] hover:text-[var(--accent-gold)]" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <div className="mt-4 flex flex-col gap-3">
        {links.map((link) => (
          <Link key={link.label} href={link.href} className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-gold)]">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
