import { v4 as uuidv4 } from "uuid";

class MessageHandler {
  constructor() {
    this.messageHistory = new Map(); // roomId -> messages[]
    this.maxHistoryPerRoom = 100;
  }

  async processMessage(socket, data) {
    const { content, roomId, type = "text", metadata = {} } = data;

    if (!content) {
      throw new Error("Message content is required");
    }

    const message = {
      id: uuidv4(),
      socketId: socket.id,
      content,
      type,
      roomId,
      metadata,
      timestamp: new Date().toISOString(),
      edited: false,
      reactions: {},
    };

    // Store message in history
    if (roomId) {
      this.addToHistory(roomId, message);
    }

    return message;
  }

  addToHistory(roomId, message) {
    if (!this.messageHistory.has(roomId)) {
      this.messageHistory.set(roomId, []);
    }

    const messages = this.messageHistory.get(roomId);
    messages.push(message);

    // Keep only recent messages
    if (messages.length > this.maxHistoryPerRoom) {
      messages.splice(0, messages.length - this.maxHistoryPerRoom);
    }
  }

  getMessageHistory(roomId, limit = 50) {
    const messages = this.messageHistory.get(roomId) || [];
    return messages.slice(-limit);
  }

  deleteMessage(messageId, roomId) {
    const messages = this.messageHistory.get(roomId);
    if (messages) {
      const index = messages.findIndex((msg) => msg.id === messageId);
      if (index !== -1) {
        messages.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  editMessage(messageId, roomId, newContent) {
    const messages = this.messageHistory.get(roomId);
    if (messages) {
      const message = messages.find((msg) => msg.id === messageId);
      if (message) {
        message.content = newContent;
        message.edited = true;
        message.editedAt = new Date().toISOString();
        return message;
      }
    }
    return null;
  }
}

export default new MessageHandler();
