import type { NextConfig } from "next";

/**
 * Next.js config.
 *
 * `images.remotePatterns` allowlists external hosts that the <Image>
 * optimizer is allowed to fetch from. Without this, remote URLs throw at
 * render time. We allow GitHub avatars for the live GitHubPreview section.
 *
 * Docs: node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/images.md
 */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/u/**",
      },
    ],
  },
};

export default nextConfig;
