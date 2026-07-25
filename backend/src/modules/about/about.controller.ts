import type { Request, Response } from "express";
import { sendSuccess } from "@/common/apiResponse.js";
import { aboutService } from "@/modules/about/about.service.js";

export const aboutController = {
  async get(_req: Request, res: Response) {
    return sendSuccess(res, await aboutService.get());
  },
  async update(req: Request, res: Response) {
    return sendSuccess(res, await aboutService.update(req.body));
  },
};
