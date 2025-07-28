## 🛠️ Installation

```bash
npm install
```

## 🏃‍♂️ Running

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## 📡 WebSocket Events

### Client Events

- `join_room`: Bergabung ke room
- `leave_room`: Keluar dari room
- `send_message`: Mengirim pesan
- `user_typing`: Indikator sedang mengetik
- `user_stop_typing`: Berhenti mengetik
- `status_update`: Update status user
- `custom_event`: Event custom

### Server Events

- `welcome`: Pesan selamat datang
- `room_joined`: Konfirmasi join room
- `room_left`: Konfirmasi leave room
- `message_received`: Pesan baru
- `user_joined`: User baru join room
- `user_left`: User keluar room
- `user_typing`: User sedang mengetik
- `user_stop_typing`: User berhenti mengetik
- `notification`: Notifikasi
- `status_update`: Update status
- `error`: Error handling
- `force_disconnect`: Disconnect paksa

## 🌐 HTTP API Endpoints

### General Endpoints

- `GET /health` - Health check
- `GET /api/stats` - Server statistics
- `GET /api/connections` - List semua koneksi
- `GET /api/rooms` - List semua room
- `GET /api/rooms/:roomId` - Detail room
- `GET /api/rooms/:roomId/messages` - History pesan room

### Event Endpoints (untuk Laravel)

- `POST /api/events/emit` - Emit event ke target spesifik
- `POST /api/events/broadcast` - Broadcast ke semua koneksi
- `POST /api/events/notify-room/:roomId` - Kirim notifikasi ke room
- `POST /api/events/disconnect/:socketId` - Disconnect user paksa

## 📋 Contoh Penggunaan

### 1. Emit Event dari Laravel

```bash
curl -X POST http://localhost:3000/api/events/emit \
  -H "Content-Type: application/json" \
  -d '{
    "event": "order_status_updated",
    "data": {
      "orderId": "12345",
      "status": "shipped",
      "message": "Pesanan Anda sedang dalam perjalanan"
    },
    "target": {
      "roomId": "user_12345"
    }
  }'
```

### 2. Broadcast Global

```bash
curl -X POST http://localhost:3000/api/events/broadcast \
  -H "Content-Type: application/json" \
  -d '{
    "event": "system_maintenance",
    "data": {
      "message": "Sistem akan maintenance dalam 30 menit",
      "scheduledAt": "2024-01-01T10:00:00Z"
    }
  }'
```

### 3. Kirim Notifikasi ke Room

```bash
curl -X POST http://localhost:3000/api/events/notify-room/chat_room_1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pesan Baru",
    "message": "Anda memiliki pesan baru dari admin",
    "type": "info",
    "data": {
      "senderId": "admin_001",
      "priority": "high"
    }
  }'
```

## 🧪 Testing dengan Postman Socket.IO

### Setup Postman Socket.IO Collection

1. **Install Postman Desktop** (bukan web version)
2. **Enable Socket.IO** di Postman settings
3. **Create New WebSocket Request**

### Test Connection

```
URL: ws://localhost:3000
Protocol: Socket.IO
```

### Test Events

#### 1. Join Room

```json
Event: join_room
Data: {
  "roomId": "test_room_1",
  "userId": "user_123",
  "userData": {
    "name": "John Doe",
    "avatar": "avatar.jpg"
  }
}
```

#### 2. Send Message

```json
Event: send_message
Data: {
  "content": "Hello everyone!",
  "roomId": "test_room_1",
  "type": "text",
  "metadata": {
    "priority": "normal"
  }
}
```

#### 3. User Typing

```json
Event: user_typing
Data: {
  "roomId": "test_room_1",
  "userId": "user_123"
}
```

#### 4. Custom Event

```json
Event: custom_event
Data: {
  "event": "product_updated",
  "payload": {
    "productId": "prod_123",
    "price": 99.99
  },
  "target": {
    "roomId": "product_watchers"
  }
}
```

### Monitoring Events

Listen untuk events berikut:

- `welcome`
- `room_joined`
- `message_received`
- `user_joined`
- `user_left`
- `notification`
- `error`
