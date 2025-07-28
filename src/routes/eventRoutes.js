import chalk from "chalk";
import express from "express";
import Joi from "joi";
import util from "util";

const router = express.Router();

// Validation schemas
const eventSchema = Joi.object({
  event: Joi.string().required(),
  data: Joi.object().default({}),
  target: Joi.object({
    roomId: Joi.string(),
    userId: Joi.string(),
    socketId: Joi.string(),
  }).optional(),
});

const broadcastSchema = Joi.object({
  event: Joi.string().required(),
  data: Joi.object().default({}),
});

// Laravel integration endpoint - emit event to specific targets
router.post("/emit", async (req, res) => {
  try {
    const { error, value } = eventSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details,
      });
    }

    const { event, data, target } = value;
    const io = req.app.get("io");

    let emittedTo = "all";

    if (target?.roomId) {
      io.to(target.roomId).emit(event, data);
      emittedTo = `room:${target.roomId}`;
    } else if (target?.userId) {
      io.to(target.userId).emit(event, data);
      emittedTo = `user:${target.userId}`;
    } else if (target?.socketId) {
      io.to(target.socketId).emit(event, data);
      emittedTo = `socket:${target.socketId}`;
    } else {
      io.emit(event, data);
    }

    console.log(
      chalk.green("✅ Event Emitted:"),
      util.inspect(
        {
          event,
          emittedTo,
          timestamp: new Date().toISOString(),
          payload: {
            event,
            data,
            target,
          },
        },
        { depth: null, colors: true }
      )
    );

    res.json({
      success: true,
      event,
      emittedTo,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
});

// Broadcast to all connections
router.post("/broadcast", async (req, res) => {
  try {
    const { error, value } = broadcastSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details,
      });
    }

    const { event, data } = value;
    const io = req.app.get("io");

    io.emit(event, data);

    res.json({
      success: true,
      event,
      emittedTo: "all",
      connectedClients: io.engine.clientsCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
});

// Send notification to room
router.post("/notify-room/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const { title, message, type = "info", data = {} } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        error: "Title and message are required",
      });
    }

    const io = req.app.get("io");
    const notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      data,
      timestamp: new Date().toISOString(),
    };

    io.to(roomId).emit("notification", notification);

    res.json({
      success: true,
      roomId,
      notification,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
});

// Force disconnect user
router.post("/disconnect/:socketId", (req, res) => {
  try {
    const { socketId } = req.params;
    const { reason = "Server requested disconnect" } = req.body;
    const io = req.app.get("io");

    const socket = io.sockets.sockets.get(socketId);

    if (!socket) {
      return res.status(404).json({
        error: "Socket not found",
      });
    }

    socket.emit("force_disconnect", { reason });
    socket.disconnect(true);

    res.json({
      success: true,
      socketId,
      reason,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
});

export default router;
