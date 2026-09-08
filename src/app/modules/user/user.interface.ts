import { Types } from "mongoose";
export type UserRole =
  | "administrator"
  | "manager"
  | "counter"
  | "waiter"
  | "kitchen";
export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  username: string;
  password: string;
  role: UserRole;
  active: boolean;
}
