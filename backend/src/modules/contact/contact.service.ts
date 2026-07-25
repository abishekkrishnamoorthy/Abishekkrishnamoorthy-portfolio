import type { Request } from "express";
import { invalidatePublicCache } from "@/jobs/cacheInvalidator.js";
import { contactRepository } from "@/modules/contact/contact.repository.js";
import { mediaService } from "@/modules/media/media.service.js";

function requestMeta(req: Request) {
  return { ipAddress: req.ip, userAgent: req.header("user-agent") };
}

export const contactService = {
  getInfo: contactRepository.getOrSeed,
  async updateInfo(data: unknown) {
    const result = await contactRepository.update(data);
    await Promise.all([invalidatePublicCache(), mediaService.syncUsageForDocument("contactContent", "singleton", result ?? data)]);
    return result;
  },
  async createMessage(data: Record<string, unknown>, req: Request) {
    if (data.website) return { id: "spam-filtered", status: "received", message: "Message received." };
    const record = await contactRepository.createMessage({ ...data, ...requestMeta(req) });
    return { id: record.id, status: "received", message: "Message received." };
  },
  async createMeetingRequest(data: Record<string, unknown>, req: Request) {
    if (data.website) return { id: "spam-filtered", status: "received", message: "Meeting request received." };
    const record = await contactRepository.createMeetingRequest({ ...data, ...requestMeta(req) });
    return { id: record.id, status: "received", message: "Meeting request received." };
  },
  listMessages: contactRepository.listMessages,
  listMeetingRequests: contactRepository.listMeetingRequests,
  updateMessageStatus: contactRepository.updateMessageStatus,
  updateMeetingStatus: contactRepository.updateMeetingStatus,
};
