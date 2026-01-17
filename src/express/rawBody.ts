import type { Request } from "express";

export function rawBodySaver(req: Request, _res: any, buf: Buffer) {
  // attach raw buffer to req for later verification
  (req as any).rawBody = buf;
}
