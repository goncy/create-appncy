import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  partialPrefetching: false,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
