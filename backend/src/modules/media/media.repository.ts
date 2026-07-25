import { MediaAssetModel } from "@/modules/media/media.model.js";

export const mediaRepository = {
  create(data: unknown) {
    return MediaAssetModel.create(data);
  },
  list(folder?: string) {
    return MediaAssetModel.find(folder ? { folder } : {}).sort({ createdAt: -1 }).lean();
  },
  findById(id: string) {
    return MediaAssetModel.findById(id);
  },
  clearUsage(collection: string, documentId: string) {
    return MediaAssetModel.updateMany({}, { $pull: { usedIn: { collection, documentId } } });
  },
  addUsage(urls: string[], usage: { collection: string; documentId: string; field: string }) {
    if (!urls.length) return Promise.resolve({ matchedCount: 0 });
    return MediaAssetModel.updateMany({ $or: [{ url: { $in: urls } }, { secureUrl: { $in: urls } }] }, { $addToSet: { usedIn: usage } });
  },
};
