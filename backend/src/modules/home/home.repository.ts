import { HomeContentModel } from "@/modules/home/home.model.js";

export const defaultHome = {
  _id: "singleton",
  hero: {
    roleBadge: "FULL-STACK DEVELOPER & AI ENGINEER",
    headline: "Building scalable software and intelligent",
    highlightedHeadline: "digital experiences.",
    subheadline:
      "Full-stack developer focused on AI-powered products, cloud-native systems, and polished user experiences that move cleanly from idea to production.",
    cta: { primaryLabel: "Explore Projects", secondaryLabel: "Contact Me" },
    status: { enabled: true, text: "Open to opportunities" },
    socialLinks: {
      linkedIn: "https://linkedin.com/in/abishekk",
      gitHub: "https://github.com/abishekk",
      email: "abishekk@example.com",
    },
  },
};

export const homeRepository = {
  async getOrSeed() {
    const home = await HomeContentModel.findByIdAndUpdate("singleton", { $setOnInsert: defaultHome }, { upsert: true, new: true });
    if (!home) return home;

    const defaults = defaultHome.hero;
    let changed = false;

    if (!home.hero) {
      home.hero = defaults;
      changed = true;
    }

    const hero = home.hero;
    if (!hero.roleBadge) {
      hero.roleBadge = defaults.roleBadge;
      changed = true;
    }
    if (!hero.status) {
      hero.status = defaults.status;
      changed = true;
    } else {
      if (hero.status.enabled === undefined) {
        hero.status.enabled = defaults.status.enabled;
        changed = true;
      }
      if (!hero.status.text) {
        hero.status.text = defaults.status.text;
        changed = true;
      }
    }
    if (!hero.socialLinks) {
      hero.socialLinks = defaults.socialLinks;
      changed = true;
    } else {
      if (hero.socialLinks.linkedIn === undefined) {
        hero.socialLinks.linkedIn = defaults.socialLinks.linkedIn;
        changed = true;
      }
      if (hero.socialLinks.gitHub === undefined) {
        hero.socialLinks.gitHub = defaults.socialLinks.gitHub;
        changed = true;
      }
      if (hero.socialLinks.email === undefined) {
        hero.socialLinks.email = defaults.socialLinks.email;
        changed = true;
      }
    }

    if (changed) await home.save();
    return home.toObject();
  },
  update(data: Omit<typeof defaultHome, "_id">) {
    return HomeContentModel.findByIdAndUpdate("singleton", data, { upsert: true, new: true }).lean();
  },
};
