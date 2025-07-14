import type { Metadata } from 'next';
import { Provider as ThemeProvider } from '@/components/ui/ThemeProvider';
import { UserFormProvider } from '@/components/ui/FormProvider';
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
                <ThemeProvider>
                    <UserFormProvider>{children}</UserFormProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
