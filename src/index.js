import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { socketHandler } from "./socketHandlers.js";
import { setIo } from "./utils/socket.js";

dotenv.config({ path: "./.env" });

const startServer = async () => {
  try {
    await connectDB();

    const server = createServer(app);
    const io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    setIo(io);
    io.on("connection", (socket) => socketHandler(io, socket));

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
