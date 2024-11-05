import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
    dynamicIO: false,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
