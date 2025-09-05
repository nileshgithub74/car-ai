// lib/arcjet.ts
import arcjet, { tokenBucket } from "@arcjet/next";

if (!process.env.ARCJET_KEY) {
  throw new Error(" Missing ARCJET_KEY in environment variables");
}

const aj = arcjet({
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
});

export default aj;
