import { computeHmac, timingSafeEqual } from "../core/hmac";

export type ShopifyVerifyParams = {
  rawBody: Buffer;
  secret: string;
  hmacHeader: string | undefined;
};

export function verifyShopifyWebhook({
  rawBody,
  secret,
  hmacHeader,
}: ShopifyVerifyParams): boolean {
  if (!hmacHeader) return false;
  const expected = computeHmac(rawBody, secret, "sha256", "base64");
  return timingSafeEqual(expected, hmacHeader.trim());
}
