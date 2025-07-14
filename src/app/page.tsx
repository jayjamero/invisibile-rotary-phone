'use client';

import { Button, HStack, VStack, Text, Box, Container, Flex } from '@chakra-ui/react';

import Header from '@/layout/Header';
import Footer from '@/layout/Footer';
import { UserFormTrigger } from '@/components/ui/FormModal';

import styles from './page.module.css';

export default function Home() {
    return (
        <div className={styles.page}>
            <Header />
            <main className={styles.main}>
                <Box
                    bg={{ base: 'rgba(255, 255, 255, 0.8)', _dark: 'rgba(0, 0, 0, 0.8)' }}
                    display="flex"
                    justifyContent="center"
                    padding={{ base: '6', md: '10' }}
                    margin={{ base: '0', md: '0' }}
                >
                    <Container maxW="8xl">
                        <Flex justify="space-between" align="stretch" textAlign="justify">
                            <VStack gap={6}>
                                <HStack>
                                    <Text fontSize="2xl" fontWeight="bold">
                                        Rick and Morty Challenge
                                    </Text>
                                </HStack>

                                <VStack gap={3} textAlign="center">
                                    <Text>
                                        Wow, I really Cronenberged up the whole place, huh Morty? Just a bunch a
                                        Cronenbergs walkin' around.
                                    </Text>

                                    <Text>
                                        Listen to your sister, Morty. To live is to risk it all, otherwise you're just
                                        an inert chunk of randomly assembled molecules drifting wherever the universe
                                        blows you.
                                    </Text>

                                    <Text>
                                        He's not a hot girl. He can't just bail on his life and set up shop in someone
                                        else's.
                                    </Text>

                                    <Text>Weddings are basically funerals with cake.</Text>

                                    <Text>
                                        You're missing the point Morty. Why would he drive a smaller toaster with
                                        wheels? I mean, does your car look like a smaller version of your house? No.
                                    </Text>
                                </VStack>
                            </VStack>
                        </Flex>
                        <VStack mt={10} align="center">
                            <UserFormTrigger>
                                <Button size="md" variant="surface" px={2} py={6} colorPalette="teal">
                                    <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="semibold">
                                        Find out more
                                    </Text>
                                </Button>
                            </UserFormTrigger>
                        </VStack>
                    </Container>
                </Box>
            </main>
            <Footer />
        </div>
    );
}
