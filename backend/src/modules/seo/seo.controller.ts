import type { Request, Response } from "express";
import { sendCreated, sendSuccess } from "@/common/apiResponse.js";
import { seoService } from "@/modules/seo/seo.service.js";

const id = (req: Request) => {
  const value = req.params.id;
  return Array.isArray(value) ? value[0] : value ?? "";
};

export const seoController = {
  async list(_req: Request, res: Response) {
    return sendSuccess(res, await seoService.list());
  },
  async getGlobalSeoPublic(_req: Request, res: Response) {
    return sendSuccess(res, await seoService.getGlobalSeo());
  },
  async resolveSeoPublic(req: Request, res: Response) {
    return sendSuccess(res, await seoService.resolve(String(req.query.path)));
  },
  async listSeoPagesPublic(_req: Request, res: Response) {
    return sendSuccess(res, await seoService.listPages());
  },
  async create(req: Request, res: Response) {
    return sendCreated(res, await seoService.create(req.body));
  },
  async update(req: Request, res: Response) {
    return sendSuccess(res, await seoService.update(id(req), req.body));
  },
  async delete(req: Request, res: Response) {
    return sendSuccess(res, await seoService.delete(id(req)));
  },
};
