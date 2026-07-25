import type { Request, Response } from "express";
import { sendSuccess } from "@/common/apiResponse.js";
import { settingsService } from "@/modules/settings/settings.service.js";

export const settingsController = {
  async get(_req: Request, res: Response) {
    return sendSuccess(res, await settingsService.get());
  },
  async update(req: Request, res: Response) {
    return sendSuccess(res, await settingsService.update(req.body));
  },
};
