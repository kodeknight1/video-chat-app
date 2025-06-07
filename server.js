const express = require("express");
const { WebSocketServer } = require("ws");
const http = require("http");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Serve static files (HTML, etc.)
app.use(express.static(path.join(__dirname, "public")));

// const rooms = new Map(); // Map roomName -> Set of clients

wss.on("connection", (ws, req) => {
  const room = req.url.split("/").pop() || "default";
  ws.room = room;

  ws.on("message", (message) => {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1 && client.room === room) {
        client.send(message.toString());
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
