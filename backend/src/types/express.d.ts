import type { HydratedDocument } from "mongoose";
import type { User } from "@/modules/users/user.model.js";

declare global {
  namespace Express {
    interface Request {
      user?: HydratedDocument<User>;
    }
  }
}
