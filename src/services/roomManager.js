import connectionManager from "./connectionManager.js";

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  async joinRoom(socket, roomId, userId = null, userData = {}) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        createdAt: new Date(),
        users: new Map(),
        metadata: {},
      });
    }

    const room = this.rooms.get(roomId);
    const userKey = userId || socket.id;

    // Add user to room
    room.users.set(userKey, {
      socketId: socket.id,
      userId: userKey,
      joinedAt: new Date(),
      userData,
    });

    // Join socket to room
    await socket.join(roomId);

    // Update connection manager
    connectionManager.addRoomToConnection(socket.id, roomId);

    socket.emit("room_joined", {
      roomId,
      userCount: room.users.size,
      users: Array.from(room.users.values()),
    });

    return room;
  }

  async leaveRoom(socket, roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Remove user from room
    const userToRemove = Array.from(room.users.values()).find(
      (user) => user.socketId === socket.id
    );

    if (userToRemove) {
      room.users.delete(userToRemove.userId);
    }

    // Leave socket room
    await socket.leave(roomId);

    // Update connection manager
    connectionManager.removeRoomFromConnection(socket.id, roomId);

    // Remove room if empty
    if (room.users.size === 0) {
      this.rooms.delete(roomId);
    }

    socket.emit("room_left", { roomId });
  }

  handleDisconnect(socket) {
    // Remove user from all rooms
    for (const [roomId, room] of this.rooms.entries()) {
      const userToRemove = Array.from(room.users.values()).find(
        (user) => user.socketId === socket.id
      );

      if (userToRemove) {
        room.users.delete(userToRemove.userId);

        // Notify room about user leaving
        socket.to(roomId).emit("user_left", {
          userId: userToRemove.userId,
          timestamp: new Date().toISOString(),
        });

        // Remove room if empty
        if (room.users.size === 0) {
          this.rooms.delete(roomId);
        }
      }
    }
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getAllRooms() {
    return Array.from(this.rooms.values());
  }

  getRoomStats() {
    const stats = {};
    for (const [roomId, room] of this.rooms.entries()) {
      stats[roomId] = {
        userCount: room.users.size,
        createdAt: room.createdAt,
      };
    }
    return stats;
  }
}

export default new RoomManager();
