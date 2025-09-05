// lib/arcjet.ts
import arcjet, { tokenBucket } from "@arcjet/next";

// Only create arcjet instance if key is available
const aj = process.env.ARCJET_KEY ? arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"], // you still configure this
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 10,
      interval: 3600,
      capacity: 10,
    }),
  ],
}) : null;

export default aj;
