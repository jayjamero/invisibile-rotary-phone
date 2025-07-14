import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/private/'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/api/', '/private/'],
            },
            {
                userAgent: 'bingbot',
                allow: '/',
                disallow: ['/api/', '/private/'],
            },
        ],
        sitemap: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://invisibile-rotary-phone.vercel.app'}/sitemap.xml`,
        host: process.env.NEXT_PUBLIC_BASE_URL || 'https://invisibile-rotary-phone.vercel.app',
    };
}
