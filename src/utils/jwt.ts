import jwt from "jsonwebtoken";
import logger from "../config/logger";

const expires = process.env.JWT_EXPIRES_IN || "90d";
logger.info(`JWT token will expire in: ${expires}`);
const options = {
  expiresIn: expires,
} as jwt.SignOptions;

export const signToken = (payload: object): string => {
  logger.info("Signing JWT token");
  return jwt.sign(payload, process.env.JWT_SECRET as string, options);
};
