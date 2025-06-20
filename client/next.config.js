/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  },
  env: {
    NEXT_PUBLIC_MCP_URL: process.env.NEXT_PUBLIC_MCP_URL || process.env.NEXT_PUBLIC_SERVER_URL || (process.env.NODE_ENV === 'production' ? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com` : 'http://localhost:3001'),
    // Backward compatibility for older code referencing NEXT_PUBLIC_SERVER_URL
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_MCP_URL || (process.env.NODE_ENV === 'production' ? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com` : 'http://localhost:3001'),
  }
}

module.exports = nextConfig 