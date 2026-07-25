import type { Express, Request } from "express";
import { Router } from "express";
import { z } from "zod";
import { AppError } from "@/common/AppError.js";
import { asyncHandler } from "@/common/asyncHandler.js";
import { sendCreated, sendSuccess } from "@/common/apiResponse.js";
import { slugSchema } from "@/common/validation.js";
import { authMiddleware } from "@/middlewares/auth.middleware.js";
import { publicCache } from "@/middlewares/cache.middleware.js";
import { contactRateLimit } from "@/middlewares/rateLimit.middleware.js";
import { rbac } from "@/middlewares/rbac.middleware.js";
import { validate } from "@/middlewares/validate.middleware.js";
import { authRoutes } from "@/modules/auth/auth.routes.js";
import { homeService } from "@/modules/home/home.service.js";
import { updateHomeSchema } from "@/modules/home/home.validation.js";
import { skillsService } from "@/modules/skills/skills.service.js";
import { updateSkillsSchema } from "@/modules/skills/skills.validation.js";
import { projectsService } from "@/modules/projects/projects.service.js";
import { projectHeaderImageUploadSchema, projectHeaderSchema, projectListQuerySchema, projectPayloadSchema, publishProjectSchema, reorderProjectsSchema, updateProjectSchema } from "@/modules/projects/projects.validation.js";
import { blogService } from "@/modules/blog/blog.service.js";
import { articleBlockSchema, articlePayloadSchema, blogListQuerySchema, blockReorderSchema, publishArticleSchema, updateArticleSchema } from "@/modules/blog/blog.validation.js";
import { contactService } from "@/modules/contact/contact.service.js";
import { contactInfoSchema, contactMessageSchema, meetingRequestSchema, statusUpdateSchema } from "@/modules/contact/contact.validation.js";
import { mediaService } from "@/modules/media/media.service.js";
import { createMediaAssetSchema, signUploadSchema } from "@/modules/media/media.validation.js";
import { experienceController } from "@/modules/experience/experience.controller.js";
import { experiencePayloadSchema, reorderExperienceSchema, updateExperienceSchema } from "@/modules/experience/experience.validation.js";
import { aboutController } from "@/modules/about/about.controller.js";
import { aboutPayloadSchema } from "@/modules/about/about.validation.js";
import { settingsController } from "@/modules/settings/settings.controller.js";
import { settingsPayloadSchema } from "@/modules/settings/settings.validation.js";
import { seoController } from "@/modules/seo/seo.controller.js";
import { seoPayloadSchema, updateSeoSchema } from "@/modules/seo/seo.validation.js";
import { auditLogController } from "@/modules/auditLogs/audit-log.controller.js";
import { writeAuditLog } from "@/modules/auditLogs/audit-log.service.js";
import { usersService } from "@/modules/users/users.service.js";
import { createUserSchema, updateRoleSchema, updateUserSchema } from "@/modules/users/users.validation.js";
import { dashboardController } from "@/modules/dashboard/dashboard.controller.js";

const idParamsSchema = z.object({ id: z.string().min(1) });
const slugParamsSchema = z.object({ slug: slugSchema });

function cmsGuard(moduleName: string, action: string) {
  return [authMiddleware, rbac(moduleName, action)];
}

function routeParam(req: Request, key: string) {
  const value = req.params[key];
  const param = Array.isArray(value) ? value[0] : value;
  if (!param) throw new AppError(400, "MISSING_ROUTE_PARAM", `Missing route parameter: ${key}`);
  return param;
}

function queryString(req: Request, key: string) {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

async function saveAndAudit<T>(req: Request, result: T, collection: string, action: string, id?: string) {
  await writeAuditLog(req, action, collection, id, req.body);
  return result;
}

export function registerRoutes(app: Express) {
  const publicRouter = Router();
  const cmsRouter = Router();

  publicRouter.get("/home", publicCache(), asyncHandler(async (_req, res) => sendSuccess(res, await homeService.publicHome())));

  publicRouter.get("/projects", publicCache(), validate({ query: projectListQuerySchema }), asyncHandler(async (req, res) => sendSuccess(res, await projectsService.list(req.query as never))));
  publicRouter.get("/projects/header", publicCache(), asyncHandler(async (_req, res) => sendSuccess(res, await projectsService.getHeader())));
  publicRouter.get("/projects/:slug", publicCache(), validate({ params: slugParamsSchema }), asyncHandler(async (req, res) => sendSuccess(res, await projectsService.detail(routeParam(req, "slug")))));
  publicRouter.get("/projects/:slug/related", publicCache(), validate({ params: slugParamsSchema }), asyncHandler(async (req, res) => sendSuccess(res, await projectsService.related(routeParam(req, "slug")))));

  publicRouter.get("/blogs", publicCache(), validate({ query: blogListQuerySchema }), asyncHandler(async (req, res) => sendSuccess(res, await blogService.list(req.query as never))));
  publicRouter.get("/blogs/:slug", publicCache(), validate({ params: slugParamsSchema }), asyncHandler(async (req, res) => sendSuccess(res, await blogService.detail(routeParam(req, "slug")))));

  publicRouter.get("/contact", publicCache(), asyncHandler(async (_req, res) => sendSuccess(res, await contactService.getInfo())));
  publicRouter.post("/contact/messages", contactRateLimit, validate({ body: contactMessageSchema }), asyncHandler(async (req, res) => sendCreated(res, await contactService.createMessage(req.body, req))));
  publicRouter.post("/contact/meeting-requests", contactRateLimit, validate({ body: meetingRequestSchema }), asyncHandler(async (req, res) => sendCreated(res, await contactService.createMeetingRequest(req.body, req))));

  cmsRouter.use("/auth", authRoutes);

  cmsRouter.get("/dashboard/summary", ...cmsGuard("dashboard", "read"), asyncHandler(dashboardController.summary));

  cmsRouter.get("/home", ...cmsGuard("home", "read"), asyncHandler(async (_req, res) => sendSuccess(res, await homeService.getCms())));
  cmsRouter.put("/home", ...cmsGuard("home", "update"), validate({ body: updateHomeSchema }), asyncHandler(async (req, res) => sendSuccess(res, await saveAndAudit(req, await homeService.updateCms(req.body), "homeContent", "update", "singleton"))));

  cmsRouter.get("/skills", ...cmsGuard("skills", "read"), asyncHandler(async (_req, res) => sendSuccess(res, await skillsService.getCms())));
  cmsRouter.put("/skills", ...cmsGuard("skills", "update"), validate({ body: updateSkillsSchema }), asyncHandler(async (req, res) => sendSuccess(res, await saveAndAudit(req, await skillsService.updateCms(req.body), "skillsContent", "update", "singleton"))));

  cmsRouter.get("/projects", ...cmsGuard("projects", "read"), asyncHandler(async (_req, res) => sendSuccess(res, await projectsService.cmsList())));
  cmsRouter.get("/projects/header", ...cmsGuard("projects", "read"), asyncHandler(async (_req, res) => sendSuccess(res, await projectsService.getHeader())));
  cmsRouter.put("/projects/header", ...cmsGuard("projects", "update"), validate({ body: projectHeaderSchema }), asyncHandler(async (req, res) => sendSuccess(res, await saveAndAudit(req, await projectsService.updateHeader(req.body), "projectHeaderContent", "update", "singleton"))));
  cmsRouter.post("/projects/header/showcase-image", ...cmsGuard("projects", "update"), validate({ body: projectHeaderImageUploadSchema }), asyncHandler(async (req, res) => sendSuccess(res, await projectsService.uploadHeaderImage(req.body))));
  cmsRouter.post("/projects", ...cmsGuard("projects", "create"), validate({ body: projectPayloadSchema }), asyncHandler(async (req, res) => sendCreated(res, await saveAndAudit(req, await projectsService.create(req.body), "projects", "create"))));
  cmsRouter.put("/projects/:slug", ...cmsGuard("projects", "update"), validate({ params: slugParamsSchema, body: updateProjectSchema }), asyncHandler(async (req, res) => sendSuccess(res, await saveAndAudit(req, await projectsService.update(routeParam(req, "slug"), req.body), "projects", "update", routeParam(req, "slug")))));
  cmsRouter.delete("/projects/:slug", ...cmsGuard("projects", "delete"), validate({ params: slugParamsSchema }), asyncHandler(async (req, res) => sendSuccess(res, await saveAndAudit(req, await projectsService.delete(routeParam(req, "slug")), "projects", "delete", routeParam(req, "slug")))));
  cmsRouter.patch("/projects/reorder", ...cmsGuard("projects", "update"), validate({ body: reorderProjectsSchema }), asyncHandler(async (req, res) => sendSuccess(res, await saveAndAudit(req, await projectsService.reorder(req.body.items), "projects", "reorder"))));
  cmsRouter.patch("/projects/:slug/publish", ...cmsGuard("projects", "publish"), validate({ params: slugParamsSchema, body: publishProjectSchema }), asyncHandler(async (req, res) => sendSuccess(res, await saveAndAudit(req, await projectsService.update(routeParam(req, "slug"), req.body), "projects", "publish", routeParam(req, "slug")))));

  cmsRouter.get("/blogs", ...cmsGuard("blogs", "read"), asyncHandler(async (_req, res) => sendSuccess(res, await blogService.cmsList())));
  cmsRouter.post("/blogs", ...cmsGuard("blogs", "create"), validate({ body: articlePayloadSchema }), asyncHandler(async (req, res) => sendCreated(res, await saveAndAudit(req, await blogService.create(req.body), "blogArticles", "create"))));
  cmsRouter.put("/blogs/:slug", ...cmsGuard("blogs", "update"), validate({ params: slugParamsSchema, body: updateArticleSchema }), asyncHandler(async (req, res) => sendSuccess(res, await saveAndAudit(req, await blogService.update(routeParam(req, "slug"), req.body), "blogArticles", "update", routeParam(req, "slug")))));
  cmsRouter.patch("/blogs/:slug/publish", ...cmsGuard("blogs", "publish"), validate({ params: slugParamsSchema, body: publishArticleSchema }), asyncHandler(async (req, res) => sendSuccess(res, await saveAndAudit(req, await blogService.publish(routeParam(req, "slug"), req.body.publishStatus), "blogArticles", "publish", routeParam(req, "slug")))));
  cmsRouter.delete("/blogs/:slug", ...cmsGuard("blogs", "delete"), validate({ params: slugParamsSchema }), asyncHandler(async (req, res) => sendSuccess(res, await saveAndAudit(req, await blogService.delete(routeParam(req, "slug")), "blogArticles", "delete", routeParam(req, "slug")))));
  cmsRouter.post("/blogs/:slug/blocks", ...cmsGuard("blogs", "update"), validate({ params: slugParamsSchema, body: articleBlockSchema }), asyncHandler(async (req, res) => sendSuccess(res, await saveAndAudit(req, await blogService.addBlock(routeParam(req, "slug"), req.body), "blogArticles", "block:add", routeParam(req, "slug")))));
  cmsRouter.patch("/blogs/:slug/blocks/reorder", ...cmsGuard("blogs", "update"), validate({ params: slugParamsSchema, body: blockReorderSchema }), asyncHandler(async (req, res) => sendSuccess(res, await saveAndAudit(req, await blogService.reorderBlocks(routeParam(req, "slug"), req.body.blockIds), "blogArticles", "block:reorder", routeParam(req, "slug")))));
  cmsRouter.delete("/blogs/:slug/blocks/:blockId", ...cmsGuard("blogs", "update"), validate({ params: z.object({ slug: slugSchema, blockId: z.string().min(1).max(60) }) }), asyncHandler(async (req, res) => sendSuccess(res, await saveAndAudit(req, await blogService.deleteBlock(routeParam(req, "slug"), routeParam(req, "blockId")), "blogArticles", "block:delete", routeParam(req, "slug")))));

  cmsRouter.get("/contact", ...cmsGuard("contact", "read"), asyncHandler(async (_req, res) => sendSuccess(res, await contactService.getInfo())));
  cmsRouter.put("/contact", ...cmsGuard("contact", "update"), validate({ body: contactInfoSchema }), asyncHandler(async (req, res) => sendSuccess(res, await saveAndAudit(req, await contactService.updateInfo(req.body), "contactContent", "update", "singleton"))));
  cmsRouter.get("/messages", ...cmsGuard("messages", "read"), asyncHandler(async (_req, res) => sendSuccess(res, await contactService.listMessages())));
  cmsRouter.patch("/messages/:id/status", ...cmsGuard("messages", "update"), validate({ params: idParamsSchema, body: statusUpdateSchema }), asyncHandler(async (req, res) => sendSuccess(res, await saveAndAudit(req, await contactService.updateMessageStatus(routeParam(req, "id"), req.body.status), "contactMessages", "status", routeParam(req, "id")))));
  cmsRouter.get("/meeting-requests", ...cmsGuard("meeting-requests", "read"), asyncHandler(async (_req, res) => sendSuccess(res, await contactService.listMeetingRequests())));
  cmsRouter.patch("/meeting-requests/:id/status", ...cmsGuard("meeting-requests", "update"), validate({ params: idParamsSchema, body: statusUpdateSchema }), asyncHandler(async (req, res) => sendSuccess(res, await saveAndAudit(req, await contactService.updateMeetingStatus(routeParam(req, "id"), req.body.status), "meetingRequests", "status", routeParam(req, "id")))));

  cmsRouter.post("/media/sign-upload", ...cmsGuard("media", "create"), validate({ body: signUploadSchema }), asyncHandler(async (req, res) => sendSuccess(res, mediaService.signUpload(req.body.folder))));
  cmsRouter.get("/media", ...cmsGuard("media", "read"), asyncHandler(async (req, res) => sendSuccess(res, await mediaService.listAssets(queryString(req, "folder")))));
  cmsRouter.post("/media", ...cmsGuard("media", "create"), validate({ body: createMediaAssetSchema }), asyncHandler(async (req, res) => sendCreated(res, await saveAndAudit(req, await mediaService.createAsset(req.body), "mediaAssets", "create"))));
  cmsRouter.delete("/media/:id", ...cmsGuard("media", "delete"), validate({ params: idParamsSchema }), asyncHandler(async (req, res) => sendSuccess(res, await saveAndAudit(req, await mediaService.deleteAsset(routeParam(req, "id")), "mediaAssets", "delete", routeParam(req, "id")))));

  cmsRouter.get("/experience", ...cmsGuard("experience", "read"), asyncHandler(experienceController.list));
  cmsRouter.post("/experience", ...cmsGuard("experience", "create"), validate({ body: experiencePayloadSchema }), asyncHandler(async (req, res) => {
    await writeAuditLog(req, "create", "experience", undefined, req.body);
    return experienceController.create(req, res);
  }));
  cmsRouter.put("/experience/:id", ...cmsGuard("experience", "update"), validate({ params: idParamsSchema, body: updateExperienceSchema }), asyncHandler(async (req, res) => {
    await writeAuditLog(req, "update", "experience", routeParam(req, "id"), req.body);
    return experienceController.update(req, res);
  }));
  cmsRouter.delete("/experience/:id", ...cmsGuard("experience", "delete"), validate({ params: idParamsSchema }), asyncHandler(async (req, res) => {
    await writeAuditLog(req, "delete", "experience", routeParam(req, "id"), req.body);
    return experienceController.delete(req, res);
  }));
  cmsRouter.patch("/experience/reorder", ...cmsGuard("experience", "update"), validate({ body: reorderExperienceSchema }), asyncHandler(async (req, res) => {
    await writeAuditLog(req, "reorder", "experience", undefined, req.body);
    return experienceController.reorder(req, res);
  }));

  cmsRouter.get("/about", ...cmsGuard("about", "read"), asyncHandler(aboutController.get));
  cmsRouter.put("/about", ...cmsGuard("about", "update"), validate({ body: aboutPayloadSchema }), asyncHandler(async (req, res) => {
    await writeAuditLog(req, "update", "aboutContent", "singleton", req.body);
    return aboutController.update(req, res);
  }));

  cmsRouter.get("/settings", ...cmsGuard("settings", "read"), asyncHandler(settingsController.get));
  cmsRouter.put("/settings", ...cmsGuard("settings", "update"), validate({ body: settingsPayloadSchema }), asyncHandler(async (req, res) => {
    await writeAuditLog(req, "update", "settings", "singleton", req.body);
    return settingsController.update(req, res);
  }));

  cmsRouter.get("/seo", ...cmsGuard("seo", "read"), asyncHandler(seoController.list));
  cmsRouter.post("/seo", ...cmsGuard("seo", "create"), validate({ body: seoPayloadSchema }), asyncHandler(async (req, res) => {
    await writeAuditLog(req, "create", "seoOverrides", undefined, req.body);
    return seoController.create(req, res);
  }));
  cmsRouter.put("/seo/:id", ...cmsGuard("seo", "update"), validate({ params: idParamsSchema, body: updateSeoSchema }), asyncHandler(async (req, res) => {
    await writeAuditLog(req, "update", "seoOverrides", routeParam(req, "id"), req.body);
    return seoController.update(req, res);
  }));
  cmsRouter.delete("/seo/:id", ...cmsGuard("seo", "delete"), validate({ params: idParamsSchema }), asyncHandler(async (req, res) => {
    await writeAuditLog(req, "delete", "seoOverrides", routeParam(req, "id"), req.body);
    return seoController.delete(req, res);
  }));

  cmsRouter.get("/users", ...cmsGuard("users", "read"), asyncHandler(async (_req, res) => sendSuccess(res, await usersService.listUsers())));
  cmsRouter.post("/users", ...cmsGuard("users", "create"), validate({ body: createUserSchema }), asyncHandler(async (req, res) => sendCreated(res, await saveAndAudit(req, await usersService.createUser(req.body), "users", "create"))));
  cmsRouter.patch("/users/:id", ...cmsGuard("users", "update"), validate({ params: idParamsSchema, body: updateUserSchema }), asyncHandler(async (req, res) => sendSuccess(res, await saveAndAudit(req, await usersService.updateUser(routeParam(req, "id"), req.body), "users", "update", routeParam(req, "id")))));
  cmsRouter.get("/roles", ...cmsGuard("roles", "read"), asyncHandler(async (_req, res) => sendSuccess(res, await usersService.listRoles())));
  cmsRouter.put("/roles/:id", ...cmsGuard("roles", "update"), validate({ params: idParamsSchema, body: updateRoleSchema }), asyncHandler(async (req, res) => sendSuccess(res, await saveAndAudit(req, await usersService.updateRole(routeParam(req, "id"), req.body.permissions), "roles", "update", routeParam(req, "id")))));
  cmsRouter.get("/audit-logs", ...cmsGuard("settings", "read"), asyncHandler(auditLogController.list));

  app.use("/api", publicRouter);
  app.use("/api/cms", cmsRouter);
}
