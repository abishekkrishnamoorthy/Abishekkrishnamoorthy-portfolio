import type { Request, Response } from "express";
import { sendSuccess } from "@/common/apiResponse.js";
import { dashboardService } from "@/modules/dashboard/dashboard.service.js";

export const dashboardController = {
  async summary(_req: Request, res: Response) {
    return sendSuccess(res, await dashboardService.summary());
  },
};
