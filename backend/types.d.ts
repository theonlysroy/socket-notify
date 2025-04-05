import { JwtPayload } from "jsonwebtoken";

declare module "jsonwebtoken" {
  export interface JwtPayload {
    userId?: number;
    role?: string;
  }
}

declare module "express" {
  interface Request {
    user?: number;
    role?: string;
  }
}
