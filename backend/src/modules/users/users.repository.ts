import { RoleModel } from "@/modules/users/role.model.js";
import { UserModel } from "@/modules/users/user.model.js";

export const usersRepository = {
  findByEmail(email: string) {
    return UserModel.findOne({ email: email.toLowerCase(), active: true }).populate("roleId");
  },
  findById(id: string) {
    return UserModel.findById(id).populate("roleId");
  },
  createUser(data: { name: string; email: string; passwordHash: string; roleId: string }) {
    return UserModel.create(data);
  },
  listUsers() {
    return UserModel.find().select("-passwordHash").populate("roleId").lean();
  },
  updateUser(id: string, data: Partial<{ name: string; email: string; roleId: string; active: boolean }>) {
    return UserModel.findByIdAndUpdate(id, data, { new: true }).select("-passwordHash").populate("roleId");
  },
  findRoleByName(name: string) {
    return RoleModel.findOne({ name });
  },
  upsertRole(name: string, permissions: Array<{ module: string; actions: string[] }>) {
    return RoleModel.findOneAndUpdate({ name }, { name, permissions }, { upsert: true, new: true });
  },
  listRoles() {
    return RoleModel.find().lean();
  },
  updateRole(id: string, permissions: Array<{ module: string; actions: string[] }>) {
    return RoleModel.findByIdAndUpdate(id, { permissions }, { new: true });
  },
};
