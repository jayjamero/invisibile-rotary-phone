import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Character Information',
    description:
        'Browse and explore Rick and Morty characters. View detailed character information, episodes, and more in our interactive character explorer.',
    keywords: [
        'Rick and Morty characters',
        'character explorer',
        'character information',
        'episodes',
        'character details',
        'interactive browser',
    ],
    openGraph: {
        title: 'Rick and Morty Character Information',
        description: 'Browse and explore Rick and Morty characters with detailed information and episode data.',
        url: '/information',
        type: 'website',
        images: [
            {
                url: '/ricky-morty-bg.jpg',
                width: 1200,
                height: 630,
                alt: 'Rick and Morty Character Explorer',
            },
        ],
    },
    twitter: {
        title: 'Rick and Morty Character Information',
        description: 'Browse and explore Rick and Morty characters with detailed information and episode data.',
        images: ['/ricky-morty-bg.jpg'],
    },
    alternates: {
        canonical: '/information',
    },
};
