import { beforeEach, describe, expect, it, vi } from "vitest";
import { contactService } from "@/modules/contact/contact.service.js";

const mocks = vi.hoisted(() => ({
  update: vi.fn(),
  invalidatePublicCache: vi.fn(),
  syncUsageForDocument: vi.fn(),
  notifyFrontendSeoRevalidation: vi.fn(),
}));

vi.mock("@/modules/contact/contact.repository.js", () => ({
  contactRepository: {
    getOrSeed: vi.fn(),
    update: mocks.update,
    createMessage: vi.fn(),
    createMeetingRequest: vi.fn(),
    listMessages: vi.fn(),
    listMeetingRequests: vi.fn(),
    updateMessageStatus: vi.fn(),
    updateMeetingStatus: vi.fn(),
  },
}));
vi.mock("@/jobs/cacheInvalidator.js", () => ({ invalidatePublicCache: mocks.invalidatePublicCache }));
vi.mock("@/modules/media/media.service.js", () => ({ mediaService: { syncUsageForDocument: mocks.syncUsageForDocument } }));
vi.mock("@/modules/seo/seo-revalidation.service.js", () => ({ notifyFrontendSeoRevalidation: mocks.notifyFrontendSeoRevalidation }));

describe("contactService SEO revalidation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.update.mockResolvedValue({ hero: { title: "Contact" } });
    mocks.invalidatePublicCache.mockResolvedValue(0);
    mocks.syncUsageForDocument.mockResolvedValue(undefined);
    mocks.notifyFrontendSeoRevalidation.mockResolvedValue(undefined);
  });

  it("invalidates the layout after Contact CMS content changes", async () => {
    await contactService.updateInfo({ hero: { title: "Updated contact" } });

    expect(mocks.notifyFrontendSeoRevalidation).toHaveBeenCalledWith({ invalidateLayout: true });
  });
});
