'use client';

import { VStack, Text, Box, Container, Heading, Flex } from '@chakra-ui/react';
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

    // Fetch Rick and Morty characters data (but skip query if no user data)
    const {
        data: charactersData,
        loading: charactersLoading,
        error: charactersError,
    } = useCharacters(hasUserData && isHydrated ? currentPage : undefined);

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
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main id="main-content" style={{ flex: 1 }} role="main" aria-label="Character information page">
                <Box
                    bg={{ base: 'rgba(255, 255, 255, 0.8)', _dark: 'rgba(0, 0, 0, 0.8)' }}
                    display="flex"
                    justifyContent="center"
                    padding={{ base: '6', md: '10' }}
                    margin={{ base: '0', md: '0' }}
                >
                    <Container maxW="8xl">
                        <VStack gap={8} align="center">
                            <Heading as="h1" size="2xl" textAlign="center" id="page-title">
                                Character Information
                            </Heading>

                            <Text
                                fontSize="2xl"
                                fontWeight="bold"
                                textAlign="center"
                                color="teal.600"
                                role="status"
                                aria-live="polite"
                            >
                                Welcome, {formData.username}!
                            </Text>

                            {/* Rick and Morty Characters Section */}
                            <Box width="100%" maxW="6xl" as="section" aria-labelledby="characters-heading">
                                <VStack gap={6} align="left">
                                    <Heading as="h2" size="xl" textAlign="center" id="characters-heading">
                                        Rick and Morty Characters
                                    </Heading>

                                    {charactersLoading && (
                                        <Flex
                                            wrap="wrap"
                                            gap="6"
                                            justify="center"
                                            role="status"
                                            aria-live="polite"
                                            aria-label="Loading characters"
                                        >
                                            {Array.from({ length: 9 }).map((_, index) => (
                                                <SkeletonCard key={index} />
                                            ))}
                                        </Flex>
                                    )}

                                    {charactersError && (
                                        <Box textAlign="center" p={8} role="alert" aria-live="assertive" as="aside">
                                            <Text color="red.500" fontSize="lg">
                                                Error loading characters: {charactersError.message}
                                            </Text>
                                        </Box>
                                    )}

                                    {charactersData?.characters && (
                                        <>
                                            <main role="main" aria-label="Characters list">
                                                <Flex wrap="wrap" gap="6" justify="center">
                                                    {charactersData.characters.results.slice(0, 9).map((character) => (
                                                        <CharacterCard
                                                            key={character.id}
                                                            character={character}
                                                            onClick={() => handleCharacterClick(character)}
                                                        />
                                                    ))}
                                                </Flex>
                                            </main>

                                            <nav role="navigation" aria-label="Pagination">
                                                <PaginationControls
                                                    currentPage={currentPage}
                                                    info={charactersData.characters.info}
                                                    totalPages={charactersData.characters.info.pages}
                                                    onPageChange={handlePageChange}
                                                />
                                            </nav>
                                        </>
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
