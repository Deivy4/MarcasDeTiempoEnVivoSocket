import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import http from "http";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Crear servidor HTTP para compartir con WebSocket
const server = http.createServer(app);

// WebSocket
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("Cliente WebSocket conectado");

  ws.on("message", (message) => {
    console.log("Mensaje recibido:", message.toString());
  });

  ws.on("close", () => {
    console.log("Cliente desconectado");
  });
});

// Endpoint HTTP para recibir tiempos desde extensión o cliente
app.post("/setTime", (req, res) => {
  const { newTime, videoId } = req.body;

  if (typeof newTime === "number" && videoId) {
    const payload = JSON.stringify({ type: "setTime", newTime, videoId });

    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(payload);
      }
    });

    res.status(200).json({ message: "Mensaje enviado a clientes WebSocket" });
  } else {
    res
      .status(400)
      .json({
        error: "Datos inválidos. Se requiere 'newTime' (number) y 'videoId'",
      });
  }
});

// Iniciar el servidor
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
