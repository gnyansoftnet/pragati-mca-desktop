import mysql from "mysql2/promise";
import { envConfig } from "./env.config";

export const db = mysql.createPool({
  host: envConfig.dbHost,
  port: envConfig.dbPort,
  user: envConfig.dbUser,
  password: envConfig.dbPassword,
  database: envConfig.dbName,
  waitForConnections: true,
  connectionLimit: 10,
});

export async function checkDatabaseConnection(): Promise<void> {
  const connection = await db.getConnection();

  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}