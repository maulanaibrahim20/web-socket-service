import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import socketHandler from "./handlers/socketHandler.js";
import httpRoutes from "./routes/httpRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import rateLimiter from "./middleware/rateLimiter.js";
import { PORT, CORS_OPTIONS } from "./config/config.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: CORS_OPTIONS,
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
});

// Middleware
app.use(helmet());
app.use(cors(CORS_OPTIONS));
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Make io accessible to routes
app.set("io", io);

// Routes
app.use("/api", httpRoutes);
app.use("/api/events", eventRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    connections: io.engine.clientsCount,
  });
});

// Socket.IO handler
socketHandler(io);

// Error handling
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

server.listen(PORT, () => {
  console.log(`🚀 WebSocket Service running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready`);
  console.log(`🌐 HTTP API available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("✅ Process terminated");
  });
});
