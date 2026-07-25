import { apiClient } from "@/services/api";
import { responseData } from "@/services/response";
import type { ApiResponse } from "@/types/common.types";
import type { ContactContent, ContactMessagePayload, ContactSubmissionResponse, MeetingRequestPayload, MeetingRequestResponse } from "@/types/contact.types";

export async function getContact(): Promise<ContactContent> {
  return responseData(await apiClient.get<ApiResponse<ContactContent>>("/contact"));
}

export async function submitContactMessage(payload: ContactMessagePayload): Promise<ContactSubmissionResponse> {
  return responseData(await apiClient.post<ApiResponse<ContactSubmissionResponse>>("/contact/messages", payload));
}

export async function submitMeetingRequest(payload: MeetingRequestPayload): Promise<MeetingRequestResponse> {
  return responseData(await apiClient.post<ApiResponse<MeetingRequestResponse>>("/contact/meeting-requests", payload));
}
