import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Em algumas versões, o 'turbo' fica no nível raiz, não dentro de 'experimental'
  experimental: {
    // Se o erro persistir, remova o bloco 'turbo' daqui
  },
  // Tente mover para cá:
  bundlePagesRouterDependencies: true, // Opcional
  transpilePackages: [], // Opcional
};

export default nextConfig;