import express from "express";
import http from "http";
import https from "https";
import fs from "fs";
import { Server } from "socket.io";

const CERT_PEM = "./cert.pem";
const KEY_PEM = "./key.pem";

const app = express();
// const server = http.createServer(app);
const server = https.createServer({
  cert: fs.readFileSync(CERT_PEM),
  key:  fs.readFileSync(KEY_PEM),
}, app);
console.log(server.key);
const io = new Server(server, {
  // cors: {
  //   origin: FRONTEND_URL,
  //   methods: ['GET','POST']
  // }
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("connect", (msg) => {
    console.log("message: " + msg);
  });
  socket.on("client-msg", (msg) => {
    if (msg == "LOGOUT") {
      console.log("run here o not?");
      // broadcast to logout the client
      io.emit("logout", {
        message: `logout`,
      });
    }
    console.log("message: " + msg);
  });
});

setInterval(() => {
  io.emit("notification", {
    message: `Server time is ${new Date().toLocaleTimeString()}`,
  });
}, 10_000); // 10 seconds

server.listen(3000, () => {
  console.log("▶️ Listening on https://localhost:3000");
});
