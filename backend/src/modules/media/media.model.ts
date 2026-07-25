import { Schema, model, type InferSchemaType } from "mongoose";

const usedInSchema = new Schema({ collection: String, documentId: String, field: String }, { _id: false, suppressReservedKeysWarning: true });

const mediaAssetSchema = new Schema(
  {
    publicId: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    secureUrl: { type: String, required: true },
    folder: { type: String, required: true, index: true },
    resourceType: { type: String, default: "image" },
    format: String,
    width: Number,
    height: Number,
    bytes: Number,
    usedIn: { type: [usedInSchema], default: [] },
    deleteFailed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

mediaAssetSchema.index({ folder: 1, createdAt: -1 });

export type MediaAsset = InferSchemaType<typeof mediaAssetSchema>;
export const MediaAssetModel = model("MediaAsset", mediaAssetSchema);
