import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    experimental: {
        optimizePackageImports: ['@chakra-ui/react'],
    },
    // Security headers
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                ],
            },
        ];
    },
    // Environment variables validation
    env: {
        NEXT_PUBLIC_GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
        NEXT_PUBLIC_MAX_QUERY_DEPTH: process.env.NEXT_PUBLIC_MAX_QUERY_DEPTH,
        NEXT_PUBLIC_MAX_QUERY_COMPLEXITY: process.env.NEXT_PUBLIC_MAX_QUERY_COMPLEXITY,
        NEXT_PUBLIC_REQUEST_TIMEOUT: process.env.NEXT_PUBLIC_REQUEST_TIMEOUT,
        NEXT_PUBLIC_RATE_LIMIT: process.env.NEXT_PUBLIC_RATE_LIMIT,
    },
};

export default nextConfig;
