'use client';

import { Button, HStack } from '@chakra-ui/react';
import { ColorModeButton } from '@/components/ui/color-mode';

import Footer from '@/layout/Footer';
import styles from './page.module.css';

export default function Home() {
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <HStack>
                    <Button variant="outline" size="xl" onClick={() => window.alert('no!')}>
                        No
                    </Button>
                    <Button size="xl" onClick={() => window.alert('yes!')}>
                        Yes
                    </Button>
                    <ColorModeButton />
                </HStack>
                <br />
                <a
                    href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Deploy now
                </a>
            </main>
            <Footer />
        </div>
    );
}
