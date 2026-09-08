import { envVars } from "../config/env";
import User from "../modules/user/user.model";
export const seedAdmin = async () => {
  const isAdminExist = await User.findOne({ username: envVars.ADMIN_USERNAME });
  if (isAdminExist) {
    console.log("Admin already exists, skipping seed");
    return;
  }
  await User.create({
    name: envVars.ADMIN_NAME,
    username: envVars.ADMIN_USERNAME,
    password: envVars.ADMIN_PASSWORD,
    role: "administrator",
  });
  console.log(
    `Admin seeded: ${envVars.ADMIN_USERNAME} / ${envVars.ADMIN_PASSWORD}`,
  );
};
