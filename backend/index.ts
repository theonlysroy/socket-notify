import dotenv from "dotenv";
import type { Application, NextFunction, Request, Response } from "express";
import express from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { createServer } from "node:http";
import {
  Socket,
  Server as SocketServer,
  type DefaultEventsMap,
  type Server,
} from "socket.io";
import dbHandling, { db, type UserRow } from "./db";
import { initSocket } from "./socket";
dotenv.config({ path: ".env" });

interface SocketApp extends Application {
  socket?: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
}

const app: SocketApp = express();
const port = Number(process.env.PORT as string) || 8003;
const tokenSecret = process.env.TOKEN_SECRET as string;
const tokenExpiry = process.env.TOKEN_EXPIRY as string;
const domain = process.env.DOMAIN as string;

const httpServer = createServer(app);
const io: Server = new SocketServer(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("socket", io);

initSocket(io);

// middlewares
async function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = (req.headers["x-access-token"] as string) ?? null;
    if (!token) throw new Error("No token found");
    const decoded: JwtPayload = jwt.verify(token, tokenSecret) as JwtPayload;
    const result = await db.get<UserRow>(
      "SELECT role FROM users WHERE id = ?",
      [decoded.userId],
    );
    if (!result) throw new Error("Unauthorized access");
    req.user = Number(decoded.userId);
    req.role = result.role;
    next();
  } catch (error: any) {
    throw error;
  }
}

async function adminAuth(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.role !== "admin") throw new Error("Admins can access this route");
    next();
  } catch (error: any) {
    throw error;
  }
}

async function userAuth(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.role !== "user") throw new Error("Login to access this route");
    next();
  } catch (error: any) {
    throw error;
  }
}

app.get("/", (req, res) => {
  res.send("ok");
});

app.post("/create-user", async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const role = req.body.role ?? "user";
    const io: Socket = req.app.get("socket") ?? null;
    if (!io)
      throw new Error(
        "Socket connection not found. Aborting notifications....",
      );

    if (!name || !email)
      throw new Error("body.name & body.email are required fields");

    const existingUser = await db.get(
      `SELECT * FROM users WHERE email = ? AND role = ?`,
      [email, role],
    );

    if (existingUser) throw new Error("Email already exists");

    const userResult = await db.run(
      "INSERT INTO users (name, email, role) VALUES (?, ?, ?)",
      [name, email, role],
    );
    if (!userResult) throw new Error("Failed to create a new user");

    const user = await db.get<UserRow>(
      `SELECT * FROM users WHERE id=?`,
      userResult.lastID,
    );
    const notifyMsg = `A new user: ${user?.name} registered.`;
    const notificationResult = await db.run(
      "INSERT INTO notifications (message, userId) VALUES (?, ?)",
      [notifyMsg, user?.id],
    );
    io.to("admins").emit("admin:notifications", notifyMsg);
    res.status(201).json({
      success: true,
      message: "Successful",
    });
  } catch (error: any) {
    next(error);
  }
});

app.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, role } = req.body;
    const result = await db.get("SELECT id, role FROM users WHERE email = ?", [
      email,
    ]);
    if (!result || result.role !== role)
      throw new Error("No user found with this email");

    const token = jwt.sign({ userId: Number(result.id), role }, tokenSecret, {
      expiresIn: tokenExpiry,
    });
    res.status(200).json({
      success: true,
      message: "Login Successful",
      data: {
        token,
      },
    });
  } catch (error: any) {
    next(error);
  }
});

app.get("/admin-notifications", auth, adminAuth, async (req, res, next) => {
  try {
    const notifications: any[] = [];
    const data = await db.all("SELECT id, message FROM notifications;");
    res.status(200).json({
      success: true,
      message: "Successful",
      data,
    });
  } catch (error: any) {
    next(error);
  }
});

app.get(
  "/verify-user",
  auth,
  userAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.user);
      const io: Socket = req.app.get("socket");
      if (!io) throw new Error("Socket not connected. Aborting...");
      if (!userId) throw new Error("user id is missing for verfying user.");
      const updateResult = await db.run(
        "UPDATE users SET isVerified = 1 WHERE id = ?",
        userId,
      );
      if ((updateResult.changes as number) < 1)
        throw new Error("Verifying user failed...");

      const userNotifyMsg = `Your account has been verified`;
      io.to(`user_${userId}`).emit("user:notifications", userNotifyMsg);
      res.status(200).json({
        success: true,
        message: "User verified",
      });
    } catch (error) {
      next(error);
    }
  },
);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(`[ERROR]\t${err}`);
  res.status(err.status || 400).json({
    success: false,
    message: err.message || "Internal Server Error",
    details: err,
  });
});

async function startServer() {
  await dbHandling();
  httpServer.listen(port, () =>
    console.log(`[INFO]\tServer @ ${domain}:${port}`),
  );
  try {
  } catch (error: any) {
    console.log(`[ERROR]\t${error.message}`);
    process.exit(1);
  }
}

startServer();
