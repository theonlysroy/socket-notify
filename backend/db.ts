import { Database, open } from "sqlite";
import sqlite3 from "sqlite3";

export interface UserRow {
  id: number;
  name: string;
  email: string;
  isVerified: number;
  role: string;
}

let db: Database;
export default async function dbHandling() {
  try {
    db = await open({
      filename: "socketNotify.db",
      driver: sqlite3.Database,
    });

    console.log(`[INFO]\tDb connected...`);
    // create table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        isVerified INTEGER NOT NULL DEFAULT 0 CHECK (isVerified IN (0, 1)),
        role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))
      );
      `);
    console.log(`[INFO]\tUser table created successfully...`);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT,
        userId TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
      `);
    console.log(`[INFO]\tNotification table created successfully...`);
  } catch (error: any) {
    console.log(`[ERROR]\t${error.message}`);
  }
}
export { db };
