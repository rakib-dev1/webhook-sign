import * as crypto from "crypto";

export type HmacEncoding = "hex" | "base64";

export function computeHmac(
  rawBody: Buffer,
  secret: string,
  algorithm: string = "sha256",
  encoding: HmacEncoding = "base64"
): string {
  return crypto.createHmac(algorithm, secret).update(rawBody).digest(encoding);
}
export function timingSafeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}
