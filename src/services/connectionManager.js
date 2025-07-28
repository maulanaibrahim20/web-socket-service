class ConnectionManager {
  constructor() {
    this.connections = new Map();
  }

  addConnection(socket) {
    this.connections.set(socket.id, {
      socket,
      connectedAt: new Date(),
      status: "online",
      rooms: new Set(),
      metadata: {},
    });
  }

  removeConnection(socketId) {
    this.connections.delete(socketId);
  }

  getConnection(socketId) {
    return this.connections.get(socketId);
  }

  getAllConnections() {
    return Array.from(this.connections.values());
  }

  getConnectionCount() {
    return this.connections.size;
  }

  updateConnectionStatus(socketId, status) {
    const connection = this.connections.get(socketId);
    if (connection) {
      connection.status = status;
      connection.lastActivity = new Date();
    }
  }

  addRoomToConnection(socketId, roomId) {
    const connection = this.connections.get(socketId);
    if (connection) {
      connection.rooms.add(roomId);
    }
  }

  removeRoomFromConnection(socketId, roomId) {
    const connection = this.connections.get(socketId);
    if (connection) {
      connection.rooms.delete(roomId);
    }
  }

  getConnectionsByRoom(roomId) {
    return Array.from(this.connections.values()).filter((connection) =>
      connection.rooms.has(roomId)
    );
  }
}

export default new ConnectionManager();
