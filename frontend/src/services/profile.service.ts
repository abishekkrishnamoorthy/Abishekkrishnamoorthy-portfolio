import { getContact } from "@/services/contact.service";
import { getHome } from "@/services/home.service";
import type { Profile } from "@/types/profile.types";

export async function getProfile(): Promise<Profile> {
  const [home, contact] = await Promise.all([getHome(), getContact()]);
  const visibleSocials = [...contact.socialLinks].filter((link) => link.visible && link.profileUrl).sort((a, b) => a.displayOrder - b.displayOrder);
  const github = visibleSocials.find((link) => link.platform === "GitHub");
  const linkedIn = visibleSocials.find((link) => link.platform === "LinkedIn");

  return {
    name: linkedIn?.username,
    headline: home.hero.headline,
    highlightedHeadline: home.hero.highlightedHeadline,
    subheadline: home.hero.subheadline,
    availabilityStatus: contact.contact.availability?.status,
    email: contact.contact.email.visible ? contact.contact.email.value : undefined,
    githubUrl: github?.profileUrl,
    linkedinUrl: linkedIn?.profileUrl,
    resumeUrl: contact.contact.resume?.visible ? contact.contact.resume.href : undefined,
    socialLinks: visibleSocials.map((link) => ({ label: link.platform, href: link.profileUrl!, value: link.username })),
    ctaLabels: { primary: home.hero.cta.primaryLabel, secondary: home.hero.cta.secondaryLabel },
  };
}
