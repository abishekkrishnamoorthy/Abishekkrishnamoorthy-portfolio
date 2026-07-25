"use client";

import { motion } from "framer-motion";
import { Bot, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/common/Button";
import { navigationLinks } from "@/constants/navigation";
import { useNavigation } from "@/context/NavigationContext";
import type { Profile } from "@/types/profile.types";

export function Navbar({ profile }: { profile?: Profile }) {
  const pathname = usePathname();
  const { openMobileNav, openAssistant } = useNavigation();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[rgba(10,10,10,0.94)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 md:h-[68px] md:px-16">
        <Link href="/" className="flex items-center gap-3" aria-label="Home">
          <Image src="/assets/branding/logo.png" alt="AK logo" width={42} height={42} className="h-9 w-9 object-contain md:h-10 md:w-10" />
          <span className="text-lg font-bold text-white">AK.</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary navigation">
          {navigationLinks.map((link) => {
            const active = link.href === "/" ? pathname === "/" : link.routable && pathname.startsWith(link.href);
            return (
              <Link key={link.label} href={link.href} className="relative py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-white">
                {link.label}
                {active ? <motion.span layoutId="nav-underline" className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-[var(--accent-gold)]" /> : null}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Button className="min-h-9 px-4" variant="secondary" size="sm" icon={<Bot className="h-4 w-4" />} onClick={openAssistant}>
            About Me AI
          </Button>
          {profile?.resumeUrl ? <Button className="min-h-9 px-4" href={profile.resumeUrl} external size="sm">Download Resume</Button> : null}
        </div>
        <button aria-label="Open navigation" className="text-white md:hidden" onClick={openMobileNav}>
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
}
