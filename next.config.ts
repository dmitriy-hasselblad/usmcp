import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zrruypidnjhtsqhjhlxn.supabase.co",
        pathname: "/storage/v1/object/public/organization-logos/**",
      },
    ],
  },
};

export default nextConfig;
