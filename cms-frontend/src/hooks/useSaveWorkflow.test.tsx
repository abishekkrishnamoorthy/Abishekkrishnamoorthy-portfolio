import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/envelope";
import { useSaveWorkflow } from "@/hooks/useSaveWorkflow";

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }));
vi.mock("@/app/providers/ToastProvider", () => ({ useToast: () => toast }));

describe("useSaveWorkflow", () => {
  beforeEach(() => vi.clearAllMocks());

  it("waits for the request and reports the standard success message", async () => {
    const { result } = renderHook(() => useSaveWorkflow());
    let finish: (() => void) | undefined;
    const request = vi.fn(() => new Promise<void>((resolve) => { finish = resolve; }));
    let saveResult: Promise<boolean> | undefined;

    act(() => { saveResult = result.current.save(request); });
    expect(result.current.isSaving).toBe(true);
    await act(async () => { finish?.(); await saveResult; });

    expect(result.current.isSaving).toBe(false);
    expect(toast.success).toHaveBeenCalledWith("Changes saved successfully");
  });

  it("ignores repeated save attempts while a request is active", async () => {
    const { result } = renderHook(() => useSaveWorkflow());
    let finish: (() => void) | undefined;
    const request = vi.fn(() => new Promise<void>((resolve) => { finish = resolve; }));
    let first: Promise<boolean> | undefined;
    let second: Promise<boolean> | undefined;

    act(() => {
      first = result.current.save(request);
      second = result.current.save(request);
    });
    expect(request).toHaveBeenCalledOnce();
    await expect(second).resolves.toBe(false);
    await act(async () => { finish?.(); await first; });
  });

  it("reports backend errors and always releases the saving state", async () => {
    const { result } = renderHook(() => useSaveWorkflow());
    await act(async () => {
      await result.current.save(() => Promise.reject(new ApiError("FORBIDDEN", "Forbidden", [], 403)));
    });
    expect(toast.error).toHaveBeenCalledWith("You do not have permission to save these changes.");
    expect(result.current.isSaving).toBe(false);
  });
});
