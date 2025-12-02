import {Request, Response, NextFunction} from "express"
import dotenv from "dotenv"
import { connectDB, disconnectDB } from "./config/database";

import app from "./app"

dotenv.config()

const port = Number(process.env.PORT)


connectDB()
const server = app.listen(port, () => {
    console.log(`App listening on port: ${port}... `)
})

// Handle Asynchronous Errors (e.g., rejected promises)
process.on('unhandledRejection', (err: unknown) => {
  console.log('💥 UNHANDLED REJECTION! Shutting down...');
  if (err instanceof Error) {
    console.log(err.name, err.message);
  } else {
    console.log(err);
  }
  server.close( async() => {
    await disconnectDB();
    process.exit(1);
  });
});

// Handle Synchronous Errors
process.on('uncaughtException', async (err) => {
  console.log('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  await disconnectDB()
  process.exit(1);
});