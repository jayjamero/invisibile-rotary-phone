import type { Metadata } from 'next';
import { Provider as ThemeProvider } from '@/components/providers/ThemeProvider';
import { UserFormProvider } from '@/components/providers/FormProvider';
import ApolloProvider from '@/components/providers/ApolloProvider/index';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import '@/styles/accessibility.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
    display: 'swap',
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        default: 'Rick and Morty Character Explorer | Leonardo AI Challenge',
        template: '%s | Rick and Morty Explorer',
    },
    description:
        'Explore Rick and Morty characters with our interactive web application. Browse character details, episodes, and more. Built with Next.js, React, and GraphQL.',
    keywords: [
        'Rick and Morty',
        'characters',
        'explorer',
        'GraphQL',
        'Next.js',
        'React',
        'Leonardo AI',
        'web application',
        'accessible design',
    ],
    authors: [{ name: 'Mero' }],
    creator: 'Mero',
    publisher: 'Leonardo AI',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        title: 'Rick and Morty Character Explorer',
        description: 'Explore Rick and Morty characters with our interactive web application',
        siteName: 'Rick and Morty Explorer',
        images: [
            {
                url: '/ricky-morty-bg.jpg',
                width: 1200,
                height: 630,
                alt: 'Rick and Morty Characters',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Rick and Morty Character Explorer',
        description: 'Explore Rick and Morty characters with our interactive web application',
        images: ['/ricky-morty-bg.jpg'],
    },
};

export default function RootLayout(props: { children: React.ReactNode }) {
    const { children } = props;
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#0070f3" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/manifest.json" />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable}`}>
                <ApolloProvider>
                    <ThemeProvider>
                        <UserFormProvider>{children}</UserFormProvider>
                    </ThemeProvider>
                </ApolloProvider>
            </body>
        </html>
    );
}
