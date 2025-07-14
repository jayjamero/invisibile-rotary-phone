'use client';

import { Button, HStack, VStack, Text, Box, Container, Flex } from '@chakra-ui/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, Suspense } from 'react';

import { useUserForm } from '@/components/providers/FormProvider';
import Header from '@/layout/Header';
import Footer from '@/layout/Footer';
import { UserFormTrigger } from '@/components/ui/FormModal';

import styles from './page.module.css';

// Component that uses useSearchParams - needs to be wrapped in Suspense
function HomeContent() {
    const { formData } = useUserForm();
    const searchParams = useSearchParams();
    const modalTriggerRef = useRef<HTMLDivElement>(null);
    const hasUserData = formData.username.trim() !== '' && formData.jobTitle.trim() !== '';

    // Auto-open modal if openModal=true in URL
    useEffect(() => {
        const openModal = searchParams.get('openModal');
        if (openModal === 'true' && modalTriggerRef.current) {
            // Find the button inside the trigger and click it
            const button = modalTriggerRef.current.querySelector('button');
            if (button) {
                button.click();
            }
        }
    }, [searchParams]);

    return (
        <div className={styles.page}>
            <Header />
            <main className={styles.main} role="main" aria-labelledby="welcome-heading">
                <Box
                    bg={{ base: 'rgba(255, 255, 255, 0.8)', _dark: 'rgba(0, 0, 0, 0.8)' }}
                    display="flex"
                    justifyContent="center"
                    padding={{ base: '6', md: '10' }}
                    margin={{ base: '0', md: '0' }}
                >
                    <Container maxW="8xl">
                        <Flex justify="space-between" align="stretch" textAlign="justify">
                            <article role="article" aria-labelledby="welcome-heading">
                                <VStack gap={6}>
                                    <header>
                                        <HStack>
                                            <Text fontSize="2xl" fontWeight="bold" as="h1" id="welcome-heading">
                                                Rick and Morty Challenge
                                            </Text>
                                        </HStack>
                                    </header>

                                    <section aria-label="Rick and Morty quotes">
                                        <VStack gap={3} textAlign="center">
                                            <blockquote>
                                                <Text>
                                                    Wow, I really Cronenberged up the whole place, huh Morty? Just a
                                                    bunch a Cronenbergs walkin&apos; around.
                                                </Text>
                                            </blockquote>

                                            <blockquote>
                                                <Text>
                                                    Listen to your sister, Morty. To live is to risk it all, otherwise
                                                    you&apos;re just an inert chunk of randomly assembled molecules
                                                    drifting wherever the universe blows you.
                                                </Text>
                                            </blockquote>

                                            <blockquote>
                                                <Text>
                                                    He&apos;s not a hot girl. He can&apos;t just bail on his life and
                                                    set up shop in someone else&apos;s.
                                                </Text>
                                            </blockquote>

                                            <blockquote>
                                                <Text>Weddings are basically funerals with cake.</Text>
                                            </blockquote>

                                            <blockquote>
                                                <Text>
                                                    You&apos;re missing the point Morty. Why would he drive a smaller
                                                    toaster with wheels? I mean, does your car look like a smaller
                                                    version of your house? No.
                                                </Text>
                                            </blockquote>
                                        </VStack>
                                    </section>
                                </VStack>
                            </article>
                        </Flex>
                        <VStack mt={10} align="center" as="aside" role="complementary" aria-label="Get started">
                            {hasUserData ? (
                                <Button asChild size="md" variant="surface" px={2} py={6} colorPalette="teal">
                                    <Link href="/information">
                                        <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="semibold">
                                            Welcome back {formData.username}
                                        </Text>
                                    </Link>
                                </Button>
                            ) : (
                                <div ref={modalTriggerRef}>
                                    <UserFormTrigger>
                                        <Button size="md" variant="surface" px={2} py={6} colorPalette="teal">
                                            <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="semibold">
                                                Get Started
                                            </Text>
                                        </Button>
                                    </UserFormTrigger>
                                </div>
                            )}
                        </VStack>
                    </Container>
                </Box>
            </main>
            <Footer />
        </div>
    );
}

export default function Home() {
    return (
        <Suspense>
            <HomeContent />
        </Suspense>
    );
}
