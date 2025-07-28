import { v4 as uuidv4 } from "uuid";
import { SOCKET_EVENTS } from "../config/config.js";
import connectionManager from "../services/connectionManager.js";
import roomManager from "../services/roomManager.js";
import messageHandler from "../services/messageHandler.js";
import eventLogger from "../utils/eventLogger.js";

export default function socketHandler(io) {
  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    console.log(`👤 New connection: ${socket.id}`);

    // Add connection to manager
    connectionManager.addConnection(socket);

    // Send welcome message
    socket.emit("welcome", {
      socketId: socket.id,
      timestamp: new Date().toISOString(),
      message: "Connected to WebSocket service",
    });

    // Join room handler
    socket.on(SOCKET_EVENTS.JOIN_ROOM, async (data) => {
      try {
        const { roomId, userId, userData } = data;

        console.log(data, roomId, userId, userData);

        if (!roomId) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: "Room ID is required" });
          return;
        }

        await roomManager.joinRoom(socket, roomId, userId, userData);

        // Notify others in room
        socket.to(roomId).emit("user_joined", {
          userId: userId || socket.id,
          userData,
          timestamp: new Date().toISOString(),
        });

        eventLogger.log("room_join", { socketId: socket.id, roomId, userId });
      } catch (error) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
      }
    });

    // Leave room handler
    socket.on(SOCKET_EVENTS.LEAVE_ROOM, async (data) => {
      try {
        const { roomId, userId } = data;

        await roomManager.leaveRoom(socket, roomId);

        // Notify others in room
        socket.to(roomId).emit("user_left", {
          userId: userId || socket.id,
          timestamp: new Date().toISOString(),
        });

        eventLogger.log("room_leave", { socketId: socket.id, roomId, userId });
      } catch (error) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
      }
    });

    // Message handler
    socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (data) => {
      try {
        const message = await messageHandler.processMessage(socket, data);

        if (data.roomId) {
          // Send to room
          io.to(data.roomId).emit("message_received", message);
        } else {
          // Broadcast to all
          io.emit("message_received", message);
        }

        eventLogger.log("message_sent", {
          socketId: socket.id,
          roomId: data.roomId,
          messageId: message.id,
        });
      } catch (error) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
      }
    });

    // Typing indicators
    socket.on(SOCKET_EVENTS.USER_TYPING, (data) => {
      const { roomId, userId } = data;
      socket.to(roomId).emit("user_typing", {
        userId: userId || socket.id,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on(SOCKET_EVENTS.USER_STOP_TYPING, (data) => {
      const { roomId, userId } = data;
      socket.to(roomId).emit("user_stop_typing", {
        userId: userId || socket.id,
        timestamp: new Date().toISOString(),
      });
    });

    // Status update handler
    socket.on(SOCKET_EVENTS.STATUS_UPDATE, (data) => {
      const { status, roomId } = data;

      connectionManager.updateConnectionStatus(socket.id, status);

      if (roomId) {
        socket.to(roomId).emit("status_update", {
          userId: socket.id,
          status,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Custom event handler for Laravel integration
    socket.on("custom_event", (data) => {
      try {
        const { event, payload, target } = data;

        if (target?.roomId) {
          socket.to(target.roomId).emit(event, payload);
        } else if (target?.userId) {
          socket.to(target.userId).emit(event, payload);
        } else {
          socket.broadcast.emit(event, payload);
        }

        eventLogger.log("custom_event", {
          socketId: socket.id,
          event,
          target,
        });
      } catch (error) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
      }
    });

    // Disconnect handler
    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log(`👋 Disconnected: ${socket.id} - Reason: ${reason}`);

      connectionManager.removeConnection(socket.id);
      roomManager.handleDisconnect(socket);

      eventLogger.log("disconnect", { socketId: socket.id, reason });
    });

    // Error handler
    socket.on("error", (error) => {
      console.error(`❌ Socket error for ${socket.id}:`, error);
      eventLogger.log("socket_error", {
        socketId: socket.id,
        error: error.message,
      });
    });
  });

  // Server-side events for Laravel integration
  io.serverEmit = (event, data, target = null) => {
    if (target?.roomId) {
      io.to(target.roomId).emit(event, data);
    } else if (target?.userId) {
      io.to(target.userId).emit(event, data);
    } else {
      io.emit(event, data);
    }
  };
}
