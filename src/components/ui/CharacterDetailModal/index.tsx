'use client';

import React, { useEffect, useRef } from 'react';
import { Dialog, Button, VStack, HStack, Text, Image, Box, Badge, Grid, GridItem } from '@chakra-ui/react';
import { LuX } from 'react-icons/lu';
import { Character } from '@/lib/graphql/types';

interface CharacterDetailModalProps {
    character: Character | null;
    isOpen: boolean;
    onClose: () => void;
}

const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({ character, isOpen, onClose }) => {
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Focus management for accessibility
    useEffect(() => {
        if (isOpen && closeButtonRef.current) {
            // Focus the close button when modal opens
            closeButtonRef.current.focus();
        }
    }, [isOpen]);

    if (!character) return null;

    const getStatusColor = (status: Character['status']) => {
        switch (status) {
            case 'Alive':
                return 'green';
            case 'Dead':
                return 'red';
            default:
                return 'gray';
        }
    };

    const getGenderColor = (gender: Character['gender']) => {
        switch (gender) {
            case 'Male':
                return 'blue';
            case 'Female':
                return 'pink';
            case 'Genderless':
                return 'purple';
            default:
                return 'gray';
        }
    };

    return (
        <Dialog.Root
            open={isOpen}
            onOpenChange={({ open }) => !open && onClose()}
            placement="center"
            motionPreset="slide-in-bottom"
        >
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content
                    maxW="4xl"
                    m="auto"
                    role="dialog"
                    aria-labelledby="character-modal-title"
                    aria-describedby="character-modal-description"
                >
                    <Dialog.Header p={6} pb={0}>
                        <Dialog.Title id="character-modal-title" fontSize="2xl" fontWeight="bold">
                            {character.name}
                        </Dialog.Title>
                    </Dialog.Header>

                    <Dialog.CloseTrigger asChild>
                        <Button
                            ref={closeButtonRef}
                            variant="ghost"
                            size="sm"
                            position="absolute"
                            top={4}
                            right={4}
                            aria-label={`Close ${character.name} character details modal`}
                        >
                            <LuX aria-hidden="true" />
                        </Button>
                    </Dialog.CloseTrigger>

                    <Dialog.Body p={6} id="character-modal-description">
                        <Grid templateColumns={{ base: '1fr', md: '300px 1fr' }} gap={6}>
                            {/* Character Image */}
                            <GridItem>
                                <Image
                                    src={character.image}
                                    alt={`Portrait of ${character.name}, a ${character.status.toLowerCase()} ${character.species.toLowerCase()}`}
                                    width="100%"
                                    borderRadius="lg"
                                    objectFit="cover"
                                    loading="lazy"
                                />
                            </GridItem>

                            {/* Character Details */}
                            <GridItem>
                                <VStack gap={4} align="start" role="region" aria-label="Character information">
                                    {/* Status and Species */}
                                    <HStack
                                        gap={3}
                                        flexWrap="wrap"
                                        role="group"
                                        aria-label="Character status and species badges"
                                    >
                                        <Badge
                                            p={2}
                                            colorPalette={getStatusColor(character.status)}
                                            variant="solid"
                                            aria-label={`Status: ${character.status}`}
                                        >
                                            {character.status}
                                        </Badge>
                                        <Badge
                                            p={2}
                                            colorPalette="blue"
                                            variant="outline"
                                            aria-label={`Species: ${character.species}`}
                                        >
                                            {character.species}
                                        </Badge>
                                        <Badge
                                            p={2}
                                            colorPalette={getGenderColor(character.gender)}
                                            variant="subtle"
                                            aria-label={`Gender: ${character.gender}`}
                                        >
                                            {character.gender}
                                        </Badge>
                                    </HStack>

                                    {/* Character Type */}
                                    {character.type && (
                                        <Box mb={2} role="group" aria-labelledby="character-type-label">
                                            <Text
                                                id="character-type-label"
                                                mb={1}
                                                fontSize="lg"
                                                fontWeight="semibold"
                                                as="h3"
                                            >
                                                Type:
                                            </Text>
                                            <Text fontSize="md">{character.type}</Text>
                                        </Box>
                                    )}

                                    {/* Origin */}
                                    <Box mb={2} role="group" aria-labelledby="character-origin-label">
                                        <Text
                                            id="character-origin-label"
                                            mb={1}
                                            fontSize="lg"
                                            fontWeight="semibold"
                                            as="h3"
                                        >
                                            Origin:
                                        </Text>
                                        <VStack gap={1} align="start">
                                            <Text fontSize="md">{character.origin.name}</Text>
                                            {character.origin.type && character.origin.type !== 'unknown' && (
                                                <Text fontSize="sm" color="gray.600">
                                                    {character.origin.type}
                                                </Text>
                                            )}
                                        </VStack>
                                    </Box>

                                    {/* Dimension */}
                                    {character.origin.dimension && character.origin.dimension !== 'unknown' && (
                                        <Box mb={2} role="group" aria-labelledby="character-dimension-label">
                                            <Text
                                                id="character-dimension-label"
                                                mb={1}
                                                fontSize="lg"
                                                fontWeight="semibold"
                                                as="h3"
                                            >
                                                Dimension:
                                            </Text>
                                            <Text fontSize="sm">{character.origin.dimension}</Text>
                                        </Box>
                                    )}

                                    {/* Current Location */}
                                    <Box mb={2} role="group" aria-labelledby="character-location-label">
                                        <Text
                                            id="character-location-label"
                                            mb={1}
                                            fontSize="lg"
                                            fontWeight="semibold"
                                            as="h3"
                                        >
                                            Last known location:
                                        </Text>
                                        <VStack gap={1} align="start">
                                            <Text fontSize="md">{character.location.name}</Text>
                                            {character.location.type && character.location.type !== 'unknown' && (
                                                <Text fontSize="sm" color="gray.600">
                                                    {character.location.type}
                                                </Text>
                                            )}
                                            {character.location.dimension &&
                                                character.location.dimension !== 'unknown' && (
                                                    <Text fontSize="sm" color="gray.600">
                                                        Dimension: {character.location.dimension}
                                                    </Text>
                                                )}
                                        </VStack>
                                    </Box>

                                    {/* Episodes */}
                                    <Box mb={2} role="region" aria-labelledby="character-episodes-label">
                                        <Text
                                            id="character-episodes-label"
                                            mb={1}
                                            fontSize="lg"
                                            fontWeight="semibold"
                                            as="h3"
                                        >
                                            Episodes ({character.episode.length}):
                                        </Text>
                                        <VStack
                                            gap={1}
                                            align="start"
                                            maxH="200px"
                                            overflowY="auto"
                                            role="list"
                                            aria-label={`List of ${character.episode.length} episodes featuring ${character.name}`}
                                        >
                                            {character.episode.slice(0, 5).map((episode) => (
                                                <Box
                                                    key={episode.id}
                                                    p={2}
                                                    borderRadius="md"
                                                    width="100%"
                                                    role="listitem"
                                                    tabIndex={0}
                                                    _focus={{
                                                        outline: '2px solid',
                                                        outlineColor: 'blue.500',
                                                        outlineOffset: '2px',
                                                    }}
                                                >
                                                    <Text
                                                        fontSize="sm"
                                                        fontWeight="medium"
                                                        aria-label={`Episode ${episode.episode}: ${episode.name}`}
                                                    >
                                                        {episode.episode}: {episode.name}
                                                    </Text>
                                                    <Text
                                                        fontSize="xs"
                                                        color="gray.600"
                                                        aria-label={`Aired on ${episode.air_date}`}
                                                    >
                                                        Air date: {episode.air_date}
                                                    </Text>
                                                </Box>
                                            ))}
                                            {character.episode.length > 5 && (
                                                <Text
                                                    fontSize="xs"
                                                    fontStyle="italic"
                                                    color="gray.500"
                                                    aria-label={`${character.episode.length - 5} additional episodes not shown`}
                                                >
                                                    ... and {character.episode.length - 5} more episodes
                                                </Text>
                                            )}
                                        </VStack>
                                    </Box>

                                    {/* Created Date */}
                                    <Box mb={2} role="group" aria-labelledby="character-created-label">
                                        <Text
                                            id="character-created-label"
                                            mb={1}
                                            fontSize="lg"
                                            fontWeight="semibold"
                                            as="h3"
                                        >
                                            Created:
                                        </Text>
                                        <Text
                                            fontSize="sm"
                                            aria-label={`Character created on ${new Date(character.created).toLocaleDateString()}`}
                                        >
                                            {new Date(character.created).toLocaleDateString()}
                                        </Text>
                                    </Box>
                                </VStack>
                            </GridItem>
                        </Grid>
                    </Dialog.Body>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};

export default CharacterDetailModal;
