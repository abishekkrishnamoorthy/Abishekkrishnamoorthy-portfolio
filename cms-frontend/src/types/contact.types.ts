export type VisibleCard = { label: string; value: string; href?: string; visible: boolean };
export type ContactContent = {
  _id?: string;
  hero: { title: string; description: string };
  contact: {
    email: VisibleCard;
    phone?: VisibleCard;
    location: VisibleCard;
    resume?: VisibleCard;
    availability?: { status: string; availableFor: string[]; responseTime: string };
    businessHours?: { days: string; hours: string; timezone: string };
  };
  communicationMethods: Array<{ id: string; type: "phone" | "meet"; title: string; description: string; duration: string; actionLabel: string; visible: boolean }>;
  socialLinks: Array<{ platform: string; username?: string; profileUrl?: string; icon: string; displayOrder: number; visible: boolean }>;
};
export type ContactMessage = { _id: string; name: string; email: string; subject: string; message: string; source?: string; status: string; createdAt: string };
export type MeetingRequest = { _id: string; meetingType: "phone" | "meet"; fullName: string; email?: string; phone?: string; preferredDate: string; preferredTime: string; timezone: string; purpose: string; message?: string; status: string; createdAt: string };
