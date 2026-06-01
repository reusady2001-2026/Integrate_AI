/** @type {import('next').NextConfig} */
// NEXT_PUBLIC_BASE_PATH is set by the GitHub Pages deploy workflow
// to "/Integrate_AI". For local `pnpm dev` and Vercel it stays empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  // Static export only for GitHub Pages; Vercel uses its native Next.js runtime.
  ...(basePath ? { output: "export", assetPrefix: basePath } : {}),
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
