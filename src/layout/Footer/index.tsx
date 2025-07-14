import { Box, Container, Flex, Text } from '@chakra-ui/react';

const Footer = () => {
    return (
        <Box width="100%" boxShadow="md" bg={{ base: 'white', _dark: 'black' }} as="footer" role="contentinfo">
            <Container fluid>
                <Flex
                    direction="column"
                    align="center"
                    textAlign="center"
                    px="2"
                    py="4"
                    role="region"
                    aria-label="Footer content"
                >
                    <Text fontSize="sm" color={{ base: 'gray.600', _dark: 'gray.400' }}>
                        <Text as="span" display="block">
                            Challenge Brief (v3.5)
                        </Text>
                        <Text as="span" display="block">
                            by Jay Jamero
                        </Text>
                    </Text>
                </Flex>
            </Container>
        </Box>
    );
};

export default Footer;
