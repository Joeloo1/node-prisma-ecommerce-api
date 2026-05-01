import nodemailer from "nodemailer";
import logger from "../config/logger";
interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}
logger.info("Email utility functions");
const sendMail = async function (option: EmailOptions): Promise<void> {
  logger.info(
    `Preparing to send email to: ${option.email} with subject: ${option.subject}`,
  );
  // create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  logger.info("Email transporter created successfully");
  // defind the email Option
  const mailOptions = {
    from: "slimmy <natours@gmail.io",
    to: option.email,
    subject: option.subject,
    text: option.message,
  };
  logger.info("Email options defined, sending email now");
  await transporter.sendMail(mailOptions);
};

export default sendMail;
