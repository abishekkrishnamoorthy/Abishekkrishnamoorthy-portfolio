import { axiosClient } from "@/lib/api/axiosClient";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ContactFormValues } from "@/features/contact/contact.schema";
import type { ContactContent, ContactMessage, MeetingRequest } from "@/types/contact.types";

export const contactService = {
  get: () => axiosClient.get<unknown, ContactContent>(ENDPOINTS.cmsContact),
  update: (body: ContactFormValues) => axiosClient.put<unknown, ContactContent>(ENDPOINTS.cmsContact, body),
  messages: () => axiosClient.get<unknown, ContactMessage[]>(ENDPOINTS.cmsMessages),
  updateMessageStatus: (id: string, status: string) => axiosClient.patch<unknown, ContactMessage>(ENDPOINTS.cmsMessageStatus(id), { status }),
  meetingRequests: () => axiosClient.get<unknown, MeetingRequest[]>(ENDPOINTS.cmsMeetingRequests),
  updateMeetingStatus: (id: string, status: string) => axiosClient.patch<unknown, MeetingRequest>(ENDPOINTS.cmsMeetingRequestStatus(id), { status }),
};
