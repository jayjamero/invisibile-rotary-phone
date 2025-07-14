import type { Metadata } from 'next';
import { Provider as ThemeProvider } from '@/components/providers/ThemeProvider';
import { UserFormProvider } from '@/components/providers/FormProvider';
import ApolloProvider from '@/components/providers/ApolloProvider/index';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Leonardo Challenge',
    authors: [{ name: 'Mero' }],
    keywords: ['Leonardo', 'Challenge', 'Next.js', 'React'],
    creator: 'Mero',
    description: 'A simple app that demonstrates the use of Next.js with Chakra UI with public graphql endpoints.',
};

export default function RootLayout(props: { children: React.ReactNode }) {
    const { children } = props;
    return (
        <html lang="en" suppressHydrationWarning>
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
