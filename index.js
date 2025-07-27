import { WebSocketServer } from "ws";

// Listas de clientes
const adminClients = new Set();
const regularClients = new Set();

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Cliente conectado, esperando identificación...");

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      // Mensaje inicial de identificación
      if (data.type === "identify") {
        if (data.role === "admin") {
          adminClients.add(ws);
          ws.role = "admin";
          console.log("Conectado como ADMIN");
        } else {
          regularClients.add(ws);
          ws.role = "client";
          console.log("Conectado como CLIENTE");
        }
        return;
      }

      // Lógica según tipo de mensaje
      if (data.type === "setTime" && ws.role === "admin") {
        // Solo el admin puede enviar este mensaje
        broadcastToClients({
          type: "setTime",
          newTime: data.newTime,
        });
      }
    } catch (err) {
      console.error("Error al parsear mensaje:", err);
    }
  });

  ws.on("close", () => {
    if (ws.role === "admin") adminClients.delete(ws);
    else if (ws.role === "client") regularClients.delete(ws);
    console.log("Cliente desconectado");
  });
});

// Función para enviar mensaje a todos los clientes normales
function broadcastToClients(messageObj) {
  const message = JSON.stringify(messageObj);
  for (const client of regularClients) {
    if (client.readyState === 1) {
      client.send(message);
    }
  }
}
