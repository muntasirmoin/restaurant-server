import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser } from "./user.interface";
interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}
const userSchema = new Schema<IUser, {}, IUserMethods>(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["administrator", "manager", "counter", "waiter", "kitchen"],
      required: true,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};
const User = model<IUser, mongoose.Model<IUser, {}, IUserMethods>>(
  "User",
  userSchema,
);
export default User;
