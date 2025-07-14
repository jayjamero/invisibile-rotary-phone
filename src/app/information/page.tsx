'use client';

import { VStack, Text, Box, Container, SimpleGrid } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useUserForm } from '@/components/providers/FormProvider';
import { useCharacters } from '@/hooks/useRickAndMorty';
import { parsePageFromUrl, generatePageUrl } from '@/components/ui/PaginationControls/pagination';
import Header from '@/layout/Header';
import Footer from '@/layout/Footer';
import CharacterCard from '@/components/ui/CharacterCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import PaginationControls from '@/components/ui/PaginationControls';
import CharacterDetailModal from '@/components/ui/CharacterDetailModal';
import { Character } from '@/lib/graphql/types';

function InformationContent() {
    const { formData, isHydrated } = useUserForm();
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasUserData = formData.username.trim() !== '' && formData.jobTitle.trim() !== '';

    // Get initial page from URL or default to 1
    const pageFromUrl = parsePageFromUrl(searchParams.get('page'));
    const [currentPage, setCurrentPage] = useState(pageFromUrl);

    // Character dialog state
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Fetch Rick and Morty characters data
    const { data: charactersData, loading: charactersLoading, error: charactersError } = useCharacters(currentPage);

    // Sync state with URL changes
    useEffect(() => {
        const urlPage = parsePageFromUrl(searchParams.get('page'));
        if (urlPage !== currentPage) {
            setCurrentPage(urlPage);
        }
    }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        const newUrl = generatePageUrl(page);
        router.push(newUrl);
    };

    const handleCharacterClick = (character: Character) => {
        setSelectedCharacter(character);
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setSelectedCharacter(null);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{ flex: 1 }}>
                <Box
                    bg={{ base: 'rgba(255, 255, 255, 0.8)', _dark: 'rgba(0, 0, 0, 0.8)' }}
                    display="flex"
                    justifyContent="center"
                    padding={{ base: '6', md: '10' }}
                    margin={{ base: '0', md: '0' }}
                >
                    <Container maxW="8xl">
                        <VStack gap={8} align="center">
                            <Text fontSize="3xl" fontWeight="bold" textAlign="center">
                                Information Page
                            </Text>

                            <Text fontSize="2xl" fontWeight="bold" textAlign="center" color="teal.600">
                                Welcome, {formData.username}!
                            </Text>

                            {/* Rick and Morty Characters Section */}
                            <Box width="100%" maxW="6xl">
                                <VStack gap={6} align="left">
                                    <Text fontSize="2xl" fontWeight="bold" textAlign="left">
                                        Rick and Morty Characters
                                    </Text>

                                    {charactersError && (
                                        <Text color="red.500" textAlign="center">
                                            Error loading characters: {charactersError.message}
                                        </Text>
                                    )}

                                    {/* Show skeleton loaders when loading */}
                                    {charactersLoading && (
                                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} width="100%">
                                            <SkeletonCard count={6} />
                                        </SimpleGrid>
                                    )}

                                    {/* Show real data when available */}
                                    {!charactersLoading && charactersData?.characters.results && (
                                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} width="100%">
                                            {charactersData.characters.results.slice(0, 6).map((character) => (
                                                <CharacterCard
                                                    key={character.id}
                                                    character={character}
                                                    onClick={() => handleCharacterClick(character)}
                                                />
                                            ))}
                                        </SimpleGrid>
                                    )}

                                    {/* Pagination Controls */}
                                    {charactersData &&
                                        !charactersLoading &&
                                        charactersData.characters.info.pages > 1 && (
                                            <VStack gap={4} align="center">
                                                <PaginationControls
                                                    currentPage={currentPage}
                                                    totalPages={charactersData.characters.info.pages}
                                                    info={charactersData.characters.info}
                                                    onPageChange={handlePageChange}
                                                />
                                                <Text fontSize="xs" color="gray.500" textAlign="center">
                                                    Page {currentPage} of {charactersData.characters.info.pages}
                                                </Text>
                                            </VStack>
                                        )}

                                    {charactersData && !charactersLoading && (
                                        <Text fontSize="sm" color="gray.600" textAlign="center">
                                            Showing 6 of {charactersData.characters.info.count} characters
                                        </Text>
                                    )}
                                </VStack>
                            </Box>
                        </VStack>
                    </Container>
                </Box>
            </main>
            <Footer />

            {/* Character Detail Dialog */}
            <CharacterDetailModal character={selectedCharacter} isOpen={isDialogOpen} onClose={handleDialogClose} />
        </div>
    );
}

export default function Information() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InformationContent />
        </Suspense>
    );
}
