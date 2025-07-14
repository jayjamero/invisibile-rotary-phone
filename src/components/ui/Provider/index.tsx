'use client';

import { ChakraProvider, defaultSystem, Theme } from '@chakra-ui/react';
import { ColorModeProvider, type ColorModeProviderProps } from '../ColorMode';

export function Provider(props: ColorModeProviderProps) {
    return (
        <ChakraProvider value={defaultSystem}>
            <Theme>
                <ColorModeProvider {...props} />
            </Theme>
        </ChakraProvider>
    );
}
