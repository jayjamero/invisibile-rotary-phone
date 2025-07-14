'use client';

import { Button, VStack, Text, Box, Container, HStack, Card } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUserForm } from '@/components/providers/FormProvider';
import Header from '@/layout/Header';
import Footer from '@/layout/Footer';
import { UserFormTrigger } from '@/components/ui/FormModal';

export default function Information() {
    const { formData, isHydrated } = useUserForm();
    const router = useRouter();
    const hasUserData = formData.username.trim() !== '' && formData.jobTitle.trim() !== '';

    // Redirect to home if no user data (only after hydration is complete)
    useEffect(() => {
        if (isHydrated && !hasUserData) {
            router.push('/?openModal=true');
        }
    }, [isHydrated, hasUserData, router]);

    // Don't render anything if not hydrated yet or if no user data
    if (!isHydrated || !hasUserData) {
        return null;
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{ flex: 1 }}>
                <Box
                    bg={{ base: 'rgba(255, 255, 255, 0.8)', _dark: 'rgba(0, 0, 0, 0.8)' }}
                    display="flex"
                    justifyContent="center"
                    padding={{ base: '6', md: '10' }}
                    minHeight="calc(100vh - 200px)"
                >
                    <Container maxW="4xl">
                        <VStack gap={8} align="center">
                            <Text fontSize="3xl" fontWeight="bold" textAlign="center">
                                Information Page
                            </Text>

                            <Text fontSize="2xl" fontWeight="bold" textAlign="center" color="teal.600">
                                Welcome, {formData.username}!
                            </Text>

                            <Card.Root width="100%" maxW="md" p={6}>
                                <Card.Header>
                                    <Text fontSize="xl" fontWeight="semibold" textAlign="center">
                                        User Profile
                                    </Text>
                                </Card.Header>
                                <Card.Body>
                                    <VStack gap={4} align="stretch">
                                        <Box>
                                            <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                                Username:
                                            </Text>
                                            <Text fontSize="lg" fontWeight="semibold">
                                                {formData.username}
                                            </Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                                Job Title:
                                            </Text>
                                            <Text fontSize="lg" fontWeight="semibold">
                                                {formData.jobTitle}
                                            </Text>
                                        </Box>
                                    </VStack>
                                </Card.Body>
                                <Card.Footer>
                                    <HStack justify="center" width="100%">
                                        <UserFormTrigger>
                                            <Button colorPalette="teal" size="md">
                                                Edit Profile
                                            </Button>
                                        </UserFormTrigger>
                                    </HStack>
                                </Card.Footer>
                            </Card.Root>
                        </VStack>
                    </Container>
                </Box>
            </main>
            <Footer />
        </div>
    );
}
