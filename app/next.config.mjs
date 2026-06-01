/** @type {import('next').NextConfig} */
// NEXT_PUBLIC_BASE_PATH is set by the GitHub Pages deploy workflow
// to "/Integrate_AI". For local `pnpm dev` it stays empty so the app
// is served from "/" as usual.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
