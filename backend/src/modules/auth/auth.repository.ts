import { Schema, model } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true },
    familyId: { type: String, required: true, index: true },
    revokedAt: { type: Date },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

export const RefreshTokenModel = model("RefreshToken", refreshTokenSchema);

export const authRepository = {
  createRefreshToken(data: { userId: string; tokenHash: string; familyId: string; expiresAt: Date }) {
    return RefreshTokenModel.create(data);
  },
  findRefreshToken(tokenHash: string) {
    return RefreshTokenModel.findOne({ tokenHash });
  },
  revokeRefreshToken(tokenHash: string) {
    return RefreshTokenModel.findOneAndUpdate({ tokenHash }, { revokedAt: new Date() });
  },
  revokeFamily(familyId: string) {
    return RefreshTokenModel.updateMany({ familyId }, { revokedAt: new Date() });
  },
};
