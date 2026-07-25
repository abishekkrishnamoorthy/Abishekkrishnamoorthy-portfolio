export type SocialLink = {
  label: string;
  href: string;
  value?: string;
};

export type Profile = {
  name?: string;
  headline: string;
  highlightedHeadline: string;
  subheadline: string;
  availabilityStatus?: string;
  email?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
  scheduleCallUrl?: string;
  socialLinks: SocialLink[];
  ctaLabels: {
    primary: string;
    secondary: string;
  };
};
