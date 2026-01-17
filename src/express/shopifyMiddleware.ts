import type { Request, Response, NextFunction } from "express";
import { verifyShopifyWebhook } from "../providers/shopify";

export type ShopifyMiddlewareOptions = {
  secret: string;
  headerName?: string; // default Shopify header
  onError?: (req: Request, res: Response) => void;
};

export function shopifyWebhookMiddleware(options: ShopifyMiddlewareOptions) {
  const headerName = options.headerName ?? "x-shopify-hmac-sha256";

  return (req: Request, res: Response, next: NextFunction) => {
    const rawBody: Buffer | undefined = (req as any).rawBody;

    if (!rawBody) {
      // If raw body missing, dev configured body parser wrong
      return res.status(400).json({
        ok: false,
        error: "RAW_BODY_MISSING",
        message:
          "Raw body is missing. Configure express.json({ verify }) using rawBodySaver.",
      });
    }

    const hmacHeader = req.headers[headerName] as string | undefined;

    const ok = verifyShopifyWebhook({
      rawBody,
      secret: options.secret,
      hmacHeader,
    });

    if (!ok) {
      if (options.onError) return options.onError(req, res);
      return res.status(401).json({ ok: false, error: "INVALID_SIGNATURE" });
    }

    return next();
  };
}
