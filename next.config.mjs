/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow Prismic/Unsplash and other https hosts during SSG.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
    // If the export worker trips over image config, skip optimization at build time.
    // You can remove this later if you prefer Next's optimizer at runtime.
    unoptimized: true,
  },
};

export default nextConfig;
