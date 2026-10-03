import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 원주 2026 웰니스클럽 3D 행사장 — QR·안내판에 적힌 짧은 주소 (해시 #stamp-… 는 브라우저가 그대로 유지)
      { source: '/wonju-2026', destination: '/wonju-2026/3d.html', permanent: false },
    ];
  },
};

export default nextConfig;
