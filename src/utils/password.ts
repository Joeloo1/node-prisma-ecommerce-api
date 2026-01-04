import bcrypt from "bcryptjs";
import crypto from "crypto";
import logger from "../config/logger";

logger.info("Password utility functions");

// Hasshing Password
export const hashPassword = async (password: string): Promise<string> => {
  logger.info("Hashing Password");
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  plainPasword: string,
  hashedPassword: string,
): Promise<boolean> => {
  logger.info("Comparing Passwords");
  return await bcrypt.compare(plainPasword, hashedPassword);
};

export const changePasswordAfter = (
  passwordChangeAt: Date | null,
  JWTTimestamp: number,
): boolean => {
  logger.info("Checking if password was changed after the token was issued");
  if (!passwordChangeAt) return false;

  const changedTimestamp = Math.floor(passwordChangeAt.getTime() / 1000);

  logger.info("password change check completed");
  return JWTTimestamp < changedTimestamp;
};

// Generating password reset token
export const createPasswordResetToken = () => {
  logger.info("Creating password reset token");
  const passwordResetToken = crypto.randomBytes(32).toString("hex");

  // hash the reset token
  const resetToken = crypto
    .createHash("sha256")
    .update(passwordResetToken)
    .digest("hex");

  const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

  logger.info("Password reset token created sccessfully");
  return {
    passwordResetToken,
    resetToken,
    resetTokenExpiry,
  };
};
