"use client";

import { useMutation } from "@tanstack/react-query";
import { askAssistant } from "@/services/assistant.service";

export function useAssistant() {
  return useMutation({ mutationFn: askAssistant });
}
