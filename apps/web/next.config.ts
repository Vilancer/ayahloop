import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    ...(process.env.ALLOWED_DEV_ORIGINS?.split(",").filter(Boolean) ?? []),
  ],
  transpilePackages: [
    "@ayahloop/shared",
    "@ayahloop/i18n",
    "@ayahloop/design-tokens",
    "@ayahloop/data-access",
  ],
  outputFileTracingRoot: path.join(appDir, "../.."),
};

export default nextConfig;
