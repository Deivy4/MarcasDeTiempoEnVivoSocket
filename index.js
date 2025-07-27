import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("New client connected");
});

console.log("WebSocket server is running on ws://localhost:8080");

import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

app.post("/setTime", (req, res) => {
  const { newTime } = req.body;
  if (newTime) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "setTime", newTime }));
      }
    });
    res.status(200).send("Message sent to WebSocket clients");
  } else {
    res.status(400).send("Invalid message");
  }
});

app.listen(PORT, () => {
  console.log(`Express server is running on http://localhost:${PORT}`);
});
