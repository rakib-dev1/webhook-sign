# hook-sign

A lightweight webhook signature verification utility for Node.js — with ready-to-use Express middleware.  
Supports Shopify webhook verification (HMAC SHA256) and can be extended for other providers.

---

## Features

- ✅ Verify webhook signature using raw request body (Buffer)
- ✅ Shopify webhook verification (`X-Shopify-Hmac-Sha256`)
- ✅ Express middleware included
- ✅ Timing-safe signature comparison (`crypto.timingSafeEqual`)
- ✅ TypeScript support

---

## Installation

```bash
npm install hook-sign
```

Or with Yarn:

```bash
yarn add hook-sign
```

### ⚠️ Important Note (Must Read)

Webhook providers sign the raw request body bytes, not the parsed JSON object. You must capture the raw request body in Express using:

```javascript
express.json({ verify: rawBodySaver })
```

If you skip this, signature verification will fail.

---

## Quick Start (Shopify + Express)

### 1. Setup Express raw body capture

```javascript
import express from "express";
import { rawBodySaver, shopifyWebhookMiddleware } from "hook-sign";

const app = express();

// Capture raw body (IMPORTANT)
app.use(
  express.json({
    verify: rawBodySaver,
  })
);
```

### 2. Add Shopify webhook route

```javascript
app.post(
  "/webhooks/shopify",
  shopifyWebhookMiddleware({
    secret: process.env.SHOPIFY_SECRET, // Your Shopify App API Secret Key
  }),
  (req, res) => {
    // ✅ Signature verified successfully

    // Your webhook payload
    console.log("Shopify Webhook Payload:", req.body);

    res.status(200).send("OK");
  }
);

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
```

### 3. Environment Variable

Your secret should be stored in `.env`:

```env
SHOPIFY_SECRET=your_shopify_app_api_secret_key
```

> ✅ **Shopify secret** = Shopify App API Secret Key (not access token)

---

## Manual Verification (Without Express Middleware)

If you don't want middleware, you can manually verify the signature:

```javascript
import { verifyShopifyWebhook } from "hook-sign";

const isValid = verifyShopifyWebhook({
  rawBody: req.rawBody,                        // Buffer
  secret: process.env.SHOPIFY_SECRET,
  hmacHeader: req.headers["x-shopify-hmac-sha256"],
});

if (!isValid) return res.status(401).send("Invalid signature");
```

---

## API Reference

### `verifyShopifyWebhook({ rawBody, secret, hmacHeader })`

Returns `true` if Shopify HMAC signature is valid.

**Example:**

```javascript
verifyShopifyWebhook({
  rawBody: Buffer.from("..."),
  secret: "my_secret",
  hmacHeader: "base64_signature",
});
```

### `shopifyWebhookMiddleware({ secret, headerName?, onError? })`

Express middleware that automatically validates Shopify signature.

**Options:**

- `secret` (required): Shopify App Secret Key
- `headerName` (optional): Custom header name (default: `x-shopify-hmac-sha256`)
- `onError` (optional): Custom error handler

### `rawBodySaver(req, res, buf)`

Express verify function used in `express.json()` to store raw body buffer:

```javascript
app.use(express.json({ verify: rawBodySaver }));
```

---

## Example: Custom Error Response

```javascript
app.post(
  "/webhooks/shopify",
  shopifyWebhookMiddleware({
    secret: process.env.SHOPIFY_SECRET,
    onError: (req, res) =>
      res.status(401).json({ ok: false, message: "Invalid Shopify signature" }),
  }),
  (req, res) => res.status(200).send("OK")
);
```

---

## Troubleshooting

### ❌ Error: `RAW_BODY_MISSING`

**✅ Fix:** Ensure you added raw body capture before your routes:

```javascript
app.use(express.json({ verify: rawBodySaver }));
```

### ❌ Signature mismatch even with correct secret

**Most common causes:**

- Using parsed JSON instead of raw body
- Running a second body parser that modifies the payload
- Using wrong Shopify secret (must be App API Secret Key)

---

## Security Tips

- Never store Shopify secret in database
- Keep secret only in `.env` / server environment variables
- Always respond quickly to webhooks (Shopify expects 200 OK)

---

## License

MIT
