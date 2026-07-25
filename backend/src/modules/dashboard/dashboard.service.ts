import { BlogArticleModel } from "@/modules/blog/blog.model.js";
import { ContactMessageModel, MeetingRequestModel } from "@/modules/contact/contact.model.js";
import { ProjectModel } from "@/modules/projects/project.model.js";

export const dashboardService = {
  async summary() {
    const [projects, articles, messages, meetings] = await Promise.all([
      ProjectModel.countDocuments(),
      BlogArticleModel.countDocuments(),
      ContactMessageModel.countDocuments({ status: "received" }),
      MeetingRequestModel.countDocuments({ status: "received" }),
    ]);
    return { projects, articles, unreadMessages: messages, pendingMeetingRequests: meetings };
  },
};
