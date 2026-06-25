import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ESLint is run separately via `npm run lint` (Next 16 no longer lints during
  // `next build`). TypeScript type-checking still runs at build time.
};

export default nextConfig;
