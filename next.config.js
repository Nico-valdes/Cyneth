/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Deshabilitar ESLint durante el build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Deshabilitar verificación de tipos durante el build
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
