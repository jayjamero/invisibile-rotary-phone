import { ReactNode } from 'react';

import { Flex } from '@chakra-ui/react';

export interface PageContainerProps {
    children?: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
    return (
        <Flex direction="column" minH="100vh">
            {children}
        </Flex>
    );
}
