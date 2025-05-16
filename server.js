import express from "express";
import http from "http";
import https from "https";
import fs from "fs";
import { Server } from "socket.io";

const CERT_PEM = "./cert.pem";
const KEY_PEM = "./key.pem";

const EVENTS = {
  REGISTER: "REGISTER_SESSION",
  LOGOUT: "LOGOUT_SESSION",
  NOTIFY:    'NOTIFICATION',
  // HEARTBEAT: 'HEARTBEAT',
  // ERROR:     'ERROR',
};

const app = express();
// const server = http.createServer(app);
const server = https.createServer({
  cert: fs.readFileSync(CERT_PEM),
  key: fs.readFileSync(KEY_PEM),
}, app);
console.log(server.key);
const io = new Server(server, {
  // cors: {
  //   origin: FRONTEND_URL,
  //   methods: ['GET','POST']
  // }
  cors: { origin: "*" },
});

// AWS.config.update({ region: AWS_REGION });
// const docClient = new AWS.DynamoDB.DocumentClient();

async function saveSession(userId, sessionId) {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
  // todo: save to DynamoDB
  // await docClient.put({
  //   TableName: SESSIONS_TABLE,
  //   Item: { userId, sessionId, expiresAt }
  // }).promise();
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // 1) REGISTER_SESSION
  socket.on(EVENTS.REGISTER, async (payload, ack) => {
    // payload may include sessionId or generate one
    const { userId: uid } = payload;
    const sessionId = payload.sessionId || uuidv4();
    socket.data.sessionId = sessionId;
    socket.data.userId = payload.userId;
    console.log(`userId: ${uid}`);
    socket.join(`user_${uid}`); // add this particular user to room
    // await saveSession(uid, sessionId);
    console.log(socket.rooms);
    ack && ack({ success: true, sessionId });
  });

  // 2) LOGOUT_SESSION
  socket.on(EVENTS.LOGOUT, async (payload, ack) => {
    const sid = payload.sessionId || socket.data.sessionId;
    socket.leave(`user_${uid}`);
    await deleteSession(uid, sid);
    ack && ack({ success: true });
    socket.disconnect();
  });

  socket.on("client-msg", async (payload, ack) => {
    const { msg, userId } = payload;
    if (msg == "LOGOUT") {
      // console.log("run here o not?");
      // // broadcast to logout the client
      // io.emit("logout", {
      //   message: `logout`,
      // });
      io.to(`user_${userId}`).emit(EVENTS.NOTIFY, {
        title: "Hello, user " + userId+ "!",
        message: "This is just for you.",
        sentAt: Date.now(),
      });

      // io.to(`user_123`).emit("notification", {
      //   title: "Hello, user 123!",
      //   message: "This is just for you.",
      //   sentAt: Date.now(),
      // });
    }
    console.log("message: " + msg);
  });
});

// setInterval(() => {
//   io.emit("notification", {
//     message: `Server time is ${new Date().toLocaleTimeString()}`,
//   });
// }, 10_000); // 10 seconds

server.listen(3000, () => {
  console.log("▶️ Listening on https://localhost:3000");
});
