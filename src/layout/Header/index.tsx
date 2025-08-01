'use client';

import { Box, Container, Flex, Text, Link, Image, Button } from '@chakra-ui/react';
import { ColorModeButton } from '../../components/ui/ColorMode';
import { UserFormTrigger } from '../../components/ui/FormModal';
import { useUserForm } from '../../components/providers/FormProvider';

/* Component for conditional button text */
const ConditionalFormButton = () => {
    const { formData } = useUserForm();
    const hasUserData = formData.username.trim() !== '' && formData.jobTitle.trim() !== '';

    return (
        <UserFormTrigger>
            <Button
                size="md"
                variant="surface"
                px={2}
                py={6}
                colorPalette="teal"
                aria-label={
                    hasUserData ? 'View and edit your profile information' : 'Get started by creating your profile'
                }
                _focus={{
                    outline: '2px solid',
                    outlineColor: 'teal.500',
                    outlineOffset: '2px',
                }}
            >
                <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="semibold">
                    {hasUserData ? 'View Profile' : 'Get Started'}
                </Text>
            </Button>
        </UserFormTrigger>
    );
};

/* To aid in implementing the menu items in mobile drawer */
const menuItems = (
    <>
        <Button
            asChild
            variant="ghost"
            px={2}
            py={6}
            _focus={{
                outline: '2px solid',
                outlineColor: 'blue.500',
                outlineOffset: '2px',
            }}
        >
            <Link
                href="/information"
                aria-label="View character information page"
                _hover={{ textDecoration: 'underline' }}
            >
                <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="semibold">
                    Information
                </Text>
            </Link>
        </Button>
        <ConditionalFormButton />
        <ColorModeButton />
    </>
);

const Header = () => {
    return (
        <Box
            bg={{ base: 'white', _dark: 'black' }}
            w="full"
            boxShadow="md"
            display="flex"
            justifyContent="center"
            as="header"
            role="banner"
        >
            <Container maxW="7xl" padding={{ base: '2', md: '4' }}>
                <Flex justify="space-between" align="stretch">
                    {/* Logo */}
                    <Link
                        href="/"
                        aria-label="Rick and Morty Character Explorer - Go to homepage"
                        _focus={{
                            outline: '2px solid',
                            outlineColor: 'blue.500',
                            outlineOffset: '2px',
                            borderRadius: 'md',
                        }}
                    >
                        <Flex gap={2} align="center" justify="flex-start">
                            <Box position="relative">
                                <Image
                                    src="/leonardo-logo.svg"
                                    alt="Leonardo AI logo"
                                    width={{ base: 20 }}
                                    aspectRatio={1 / 1}
                                />
                            </Box>
                            <Text
                                display={{ smDown: 'none' }}
                                fontSize={{ base: 'sm', md: 'md' }}
                                fontWeight="bold"
                                as="span"
                            >
                                Rick and Morty
                            </Text>
                        </Flex>
                    </Link>
                    {/* Menu items */}
                    <Flex
                        gap={3}
                        align="center"
                        justify="flex-end"
                        as="nav"
                        role="navigation"
                        aria-label="Main navigation"
                    >
                        {menuItems}
                    </Flex>
                </Flex>
            </Container>
        </Box>
    );
};

export default Header;
