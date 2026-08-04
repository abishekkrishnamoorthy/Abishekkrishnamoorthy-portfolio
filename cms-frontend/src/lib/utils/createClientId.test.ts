import { afterEach, describe, expect, it, vi } from "vitest";
import { createClientId } from "@/lib/utils/createClientId";

describe("createClientId", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses crypto.randomUUID when available", () => {
    vi.stubGlobal("crypto", {
      randomUUID: () => "native-id",
    });

    expect(createClientId("block")).toBe("block-native-id");
  });

  it("falls back to getRandomValues when randomUUID is unavailable", () => {
    vi.stubGlobal("crypto", {
      getRandomValues: (bytes: Uint8Array) => {
        bytes.forEach((_, index) => {
          bytes[index] = index;
        });
        return bytes;
      },
    });

    expect(createClientId("block")).toMatch(/^block-[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-8[\da-f]{3}-[\da-f]{12}$/);
  });
});
