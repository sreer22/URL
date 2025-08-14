declare module "next-pwa" {
  import type { NextConfig } from "next";
  type WithPWAOptions = {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    fallbacks?: { document?: string };
  };
  export default function withPWA(options?: WithPWAOptions): (nextConfig: NextConfig) => NextConfig;
}