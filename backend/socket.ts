import type { Server, Socket } from "socket.io";
import jwt, { decode } from "jsonwebtoken";
import { db, type UserRow } from "./db";
import type { JwtPayload } from "jsonwebtoken";

const tokenSecret = process.env.TOKEN_SECRET as string;
const userSockets = new Map<string, Socket>();

export function initSocket(io: Server) {
  io.on("connection", async (socket) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      console.log(`[ERROR]\tAuth token missing in socket header`);
      socket.disconnect(true);
      return;
    }
    // validating the token
    const decoded: JwtPayload = jwt.verify(token, tokenSecret) as JwtPayload;
    const result = await db.get<UserRow>(
      "SELECT role FROM users WHERE id = ?",
      [Number(decoded.userId)],
    );
    if (!result) {
      console.log(`[ERROR]\tError fetching user role: ${result}`);
      socket.disconnect(true);
      return;
    }
    const role = result.role;
    if (role === "admin") {
      socket.join("admins");
      console.log(`[INFO]\tUser ${decoded.userId} joined 'admins' room`);
    } else {
      socket.join(`user_${Number(decoded.userId)}`);
      console.log(`[INFO]\tUser ${decoded.userId} joined a room`);
    }

    socket.on("disconnect", () => {
      console.log(`[INFO]\t⚡ disconnected... ${socket.id}`);
    });
  });
}
