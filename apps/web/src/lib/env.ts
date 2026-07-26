import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Runtime-validated environment variables.
 *
 * The point of validating here rather than reading `process.env` inline is that a
 * missing or malformed variable fails at build/boot with a readable message,
 * instead of surfacing as `undefined` three layers deep in a repository call at
 * 2am during the tournament.
 *
 * `client` variables must be prefixed NEXT_PUBLIC_ and are inlined into the
 * browser bundle — never put a secret there.
 */
export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    /* Optional today; Day 3 introduces Prisma and makes it required. Declared now
       so the shape of production config is visible from the start. */
    DATABASE_URL: z.url().optional(),
  },

  client: {
    NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  /* Docker builds and some CI steps run without secrets present. This escape
     hatch keeps them working without weakening validation where it matters. */
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",

  /* Treat "" as missing. An empty string in a .env file is almost always a
     mistake, and without this it silently passes a `.optional()` check. */
  emptyStringAsUndefined: true,
});
