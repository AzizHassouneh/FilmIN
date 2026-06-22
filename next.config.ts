import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  // Pin the workspace root — a stray parent lockfile (~/package-lock.json) would
  // otherwise be inferred as the root in Next 16 (Turbopack).
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url)),
  },
};

export default nextConfig;
