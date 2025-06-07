const express = require("express");
const { WebSocketServer } = require("ws");
const http = require("http");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Serve static files (HTML, etc.)
app.use(express.static(path.join(__dirname, "public")));

const rooms = new Map(); // Map roomName -> Set of clients

wss.on("connection", (ws) => {
  let joinedRoom = null;

  ws.on("message", (message) => {
    try {
      const { room, data } = JSON.parse(message);
      if (!room || !data) return;

      if (!rooms.has(room)) rooms.set(room, new Set());
      const clients = rooms.get(room);

      if (!joinedRoom) {
        joinedRoom = room;
        clients.add(ws);
        ws.on("close", () => {
          clients.delete(ws);
          if (clients.size === 0) rooms.delete(room);
        });
      }

      // Send signal to all other clients in the same room
      clients.forEach((client) => {
        if (client !== ws && client.readyState === 1) {
          client.send(JSON.stringify({ room, data }));
        }
      });
    } catch (err) {
      console.error("Failed to handle message:", err);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
