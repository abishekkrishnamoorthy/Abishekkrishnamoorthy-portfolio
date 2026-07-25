import { ContactContentModel, ContactMessageModel, MeetingRequestModel } from "@/modules/contact/contact.model.js";

export const defaultContact = {
  _id: "singleton",
  hero: { title: "Let's Connect", description: "Whether you're hiring, collaborating, or discussing a project, I'm always happy to connect." },
  contact: {
    email: { label: "Email", value: "abishek@example.com", href: "mailto:abishek@example.com", visible: true },
    phone: { label: "Phone", value: "+91 98765 43210", href: "tel:+919876543210", visible: false },
    location: { label: "Location", value: "India · Open to Remote", visible: true },
    resume: { label: "Resume", value: "Download resume", href: "/resume.pdf", visible: true },
    availability: { status: "Open to Opportunities", availableFor: ["Full-Time", "Freelance", "Contract", "Remote"], responseTime: "Within 24 Hours" },
    businessHours: { days: "Monday - Friday", hours: "10 AM - 7 PM", timezone: "Asia/Kolkata" },
  },
  communicationMethods: [
    { id: "phone", type: "phone", title: "Phone Call", description: "Ideal for quick discussions, job opportunities, or project consultations.", duration: "15-30 Minutes", actionLabel: "Request Phone Call", visible: true },
    { id: "meet", type: "meet", title: "Google Meet", description: "Perfect for technical discussions, project demos, and detailed conversations.", duration: "30 Minutes", actionLabel: "Schedule Google Meet", visible: true },
  ],
  socialLinks: [
    { platform: "GitHub", username: "@abishekk", profileUrl: "https://github.com/abishekk", icon: "Code2", displayOrder: 1, visible: true },
    { platform: "LinkedIn", username: "Abishek Krishnamoorthy", profileUrl: "https://linkedin.com/in/abishekk", icon: "BriefcaseBusiness", displayOrder: 2, visible: true },
  ],
};

export const contactRepository = {
  getOrSeed() {
    return ContactContentModel.findByIdAndUpdate("singleton", { $setOnInsert: defaultContact }, { upsert: true, new: true }).lean();
  },
  update(data: unknown) {
    return ContactContentModel.findByIdAndUpdate("singleton", data as Record<string, unknown>, { upsert: true, new: true }).lean();
  },
  createMessage(data: unknown) {
    return ContactMessageModel.create(data);
  },
  createMeetingRequest(data: unknown) {
    return MeetingRequestModel.create(data);
  },
  listMessages() {
    return ContactMessageModel.find().sort({ createdAt: -1 }).lean();
  },
  listMeetingRequests() {
    return MeetingRequestModel.find().sort({ createdAt: -1 }).lean();
  },
  updateMessageStatus(id: string, status: string) {
    return ContactMessageModel.findByIdAndUpdate(id, { status }, { new: true });
  },
  updateMeetingStatus(id: string, status: string) {
    return MeetingRequestModel.findByIdAndUpdate(id, { status }, { new: true });
  },
};
