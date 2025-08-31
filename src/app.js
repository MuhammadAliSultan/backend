import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Cookie parser
app.use(cookieParser());

// Serve static files
app.use(express.static(path.resolve("public")));

// Import routes
import userRouter from "./routes/user.routes.js";
//import personalChatRouter from "./routes/personalChat.routes.js";
//import groupChatRouter from "./routes/groupChat.routes.js";
import personalMessageRouter from "./routes/personalMessage.routes.js";
//import groupMessageRouter from "./routes/groupMessage.routes.js";

// API Routes
app.use("/api/v1/users", userRouter);
//app.use("/api/v1/personal-chats", personalChatRouter);
//app.use("/api/v1/group-chats", groupChatRouter);
app.use("/api/v1/personal-messages", personalMessageRouter);
//app.use("/api/v1/group-messages", groupMessageRouter);

// Default route
app.get("/", (req, res) => {
  res.send("Dev-Chat Backend is running ✅");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ status, message });
});

export { app };
