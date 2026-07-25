import type { Request, Response } from "express";
import { sendCreated, sendSuccess } from "@/common/apiResponse.js";
import { experienceService } from "@/modules/experience/experience.service.js";

const id = (req: Request) => {
  const value = req.params.id;
  return Array.isArray(value) ? value[0] : value ?? "";
};

export const experienceController = {
  async list(_req: Request, res: Response) {
    return sendSuccess(res, await experienceService.list());
  },
  async create(req: Request, res: Response) {
    return sendCreated(res, await experienceService.create(req.body));
  },
  async update(req: Request, res: Response) {
    return sendSuccess(res, await experienceService.update(id(req), req.body));
  },
  async delete(req: Request, res: Response) {
    return sendSuccess(res, await experienceService.delete(id(req)));
  },
  async reorder(req: Request, res: Response) {
    return sendSuccess(res, await experienceService.reorder(req.body.items));
  },
};
