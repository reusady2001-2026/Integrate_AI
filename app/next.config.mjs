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
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // pptxgenjs uses node: protocol imports; strip the prefix so fallback can catch them
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (res) => {
          res.request = res.request.replace(/^node:/, "");
        }),
      );
      config.resolve = config.resolve ?? {};
      config.resolve.fallback = {
        ...(config.resolve.fallback ?? {}),
        fs: false,
        path: false,
        stream: false,
        http: false,
        https: false,
        url: false,
        crypto: false,
        os: false,
        buffer: false,
        zlib: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }
    return config;
  },
};

export default nextConfig;
