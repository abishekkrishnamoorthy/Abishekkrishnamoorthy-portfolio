import { MediaAssetModel } from "@/modules/media/media.model.js";

export async function findOrphanedMediaAssets() {
  return MediaAssetModel.find({ usedIn: { $size: 0 }, deleteFailed: false }).lean();
}
