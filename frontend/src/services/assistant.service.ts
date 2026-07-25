import { notImplemented } from "@/types/common.types";

export type AssistantRequest = { message: string; projectSlug?: string };
export type AssistantResponse = { message: string };

export function askAssistant(request: AssistantRequest): Promise<AssistantResponse> {
  void request;
  return notImplemented("Portfolio assistant");
}
