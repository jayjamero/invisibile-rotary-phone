'use client';

import Image from 'next/image';
import { Button, HStack } from '@chakra-ui/react';
import { ColorModeButton } from '@/components/ui/color-mode';
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
            </main>
            <footer className={styles.footer}>
                <a
                    className={styles.primary}
                    href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Image className={styles.logo} src="/vercel.svg" alt="Vercel logomark" width={20} height={20} />
                    Deploy now
                </a>
            </footer>
        </div>
    );
}
