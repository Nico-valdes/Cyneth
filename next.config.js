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
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fvsa.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'griferiapeirano.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ferrum.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Configuración para evitar descargas forzadas
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Headers globales para evitar descargas
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
      // Headers específicos para imágenes
      {
        source: '/api/images/:path*',
        headers: [
          {
            key: 'Content-Disposition',
            value: 'inline',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Headers específicos para el proxy de imágenes
      {
        source: '/api/proxy-image',
        headers: [
          {
            key: 'Content-Disposition',
            value: 'inline',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
