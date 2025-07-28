export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || "development";

export const CORS_OPTIONS = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
    "http://localhost:8000",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

export const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
};

export const SOCKET_EVENTS = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
  SEND_MESSAGE: "send_message",
  BROADCAST_MESSAGE: "broadcast_message",
  USER_TYPING: "user_typing",
  USER_STOP_TYPING: "user_stop_typing",
  NOTIFICATION: "notification",
  STATUS_UPDATE: "status_update",
  ERROR: "error",
};
