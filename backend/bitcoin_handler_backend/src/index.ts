import express from "express";
import { Request, Response } from "express";
import prisma from "./prisma/client";
import orderRoutes from "./routes/order.routes";
import paymentAttemptRoutes from "./routes/payment_attempts.routes";
import cors from "cors";
import { error_handler } from "./middleware/error_handler";
import axios from "axios";
import WebSocket from "ws";
import http from "http";
import { create_pool_watcher } from "./util/pool/create_pool_watcher";
import { watch_order } from "./services/watch_service";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(error_handler);

app.use("/api/orders", orderRoutes);
app.use("/api/payment-attempts", paymentAttemptRoutes);

//helloworld
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Crear servidor HTTP
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
let sockets: WebSocket[] = [];

wss.on("connection", (ws) => {
  sockets.push(ws);
  ws.on("close", () => {
    sockets = sockets.filter((s) => s !== ws);
  });
});

function notifyClients(data: any) {
  sockets.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });
}

app.post("/api/start-watcher", async (req, res) => {
  const { payment_attempt_code } = req.body;
  if (payment_attempt_code) watcher.add(payment_attempt_code);

  res.status(200).send("Watcher iniciado");
});

const watcher = create_pool_watcher<string>(async (payment_attempt_code) => {
  return await watch_order(payment_attempt_code);
});

// Iniciar el watcher (una sola vez)
watcher.start();
