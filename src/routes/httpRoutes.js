import express from "express";
import connectionManager from "../services/connectionManager.js";
import roomManager from "../services/roomManager.js";
import messageHandler from "../services/messageHandler.js";

const router = express.Router();

// Get server stats
router.get("/stats", (req, res) => {
  res.json({
    connections: connectionManager.getConnectionCount(),
    rooms: roomManager.getAllRooms().length,
    roomStats: roomManager.getRoomStats(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Get all connections
router.get("/connections", (req, res) => {
  const connections = connectionManager.getAllConnections().map((conn) => ({
    socketId: conn.socket.id,
    connectedAt: conn.connectedAt,
    status: conn.status,
    rooms: Array.from(conn.rooms),
    lastActivity: conn.lastActivity,
  }));

  res.json({ connections });
});

// Get rooms
router.get("/rooms", (req, res) => {
  const rooms = roomManager.getAllRooms().map((room) => ({
    id: room.id,
    userCount: room.users.size,
    createdAt: room.createdAt,
    users: Array.from(room.users.values()).map((user) => ({
      userId: user.userId,
      joinedAt: user.joinedAt,
      userData: user.userData,
    })),
  }));

  res.json({ rooms });
});

// Get room details
router.get("/rooms/:roomId", (req, res) => {
  const { roomId } = req.params;
  const room = roomManager.getRoom(roomId);

  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  res.json({
    id: room.id,
    userCount: room.users.size,
    createdAt: room.createdAt,
    users: Array.from(room.users.values()),
    messages: messageHandler.getMessageHistory(roomId),
  });
});

// Get message history
router.get("/rooms/:roomId/messages", (req, res) => {
  const { roomId } = req.params;
  const { limit = 50 } = req.query;

  const messages = messageHandler.getMessageHistory(roomId, parseInt(limit));
  res.json({ messages });
});

export default router;
