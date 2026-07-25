"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getContact, submitContactMessage, submitMeetingRequest } from "@/services/contact.service";

export function useContact() {
  return useQuery({ queryKey: ["contact"], queryFn: getContact, staleTime: 1000 * 60 * 5 });
}

export function useSubmitContactMessage() {
  return useMutation({ mutationFn: submitContactMessage });
}

export function useSubmitMeetingRequest() {
  return useMutation({ mutationFn: submitMeetingRequest });
}
