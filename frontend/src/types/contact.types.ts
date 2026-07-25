export type MeetingType = "phone" | "meet";

export type MeetingRequestPayload = {
  meetingType: MeetingType;
  fullName: string;
  email?: string;
  phone?: string;
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  purpose: string;
  message?: string;
};

export type MeetingRequestResponse = {
  id: string;
  status: "received";
  message: string;
};

export type ContactMessagePayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  source?: string;
};

export type ContactSubmissionResponse = MeetingRequestResponse;

export type ContactCard = {
  label: string;
  value: string;
  href?: string;
  visible: boolean;
};

export type CommunicationMethod = {
  id: string;
  type: MeetingType;
  title: string;
  description: string;
  duration: string;
  actionLabel: string;
  visible: boolean;
};

export type ContactSocialLink = {
  platform: string;
  username?: string;
  profileUrl?: string;
  icon: string;
  displayOrder: number;
  visible: boolean;
};

export type ContactContent = {
  hero: { title: string; description: string };
  contact: {
    email: ContactCard;
    phone?: ContactCard;
    location: ContactCard;
    resume?: ContactCard;
    availability?: { status: string; availableFor: string[]; responseTime: string };
    businessHours?: { days: string; hours: string; timezone: string };
  };
  communicationMethods: CommunicationMethod[];
  socialLinks: ContactSocialLink[];
};
