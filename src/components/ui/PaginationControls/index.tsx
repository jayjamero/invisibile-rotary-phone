import React from 'react';
import { Button, HStack, Text } from '@chakra-ui/react';
import {
    generatePageNumbers,
    canNavigatePrev,
    canNavigateNext,
    PaginationInfo,
} from '@/components/ui/PaginationControls/pagination';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    info: PaginationInfo;
    onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, info, onPageChange }) => {
    const pageNumbers = generatePageNumbers({ currentPage, totalPages });
    const canGoPrev = canNavigatePrev(info);
    const canGoNext = canNavigateNext(info);

    return (
        <nav role="navigation" aria-label="Character pages navigation">
            <HStack gap="2" justify="center" wrap="wrap">
                <Button
                    py={2}
                    px={3}
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!canGoPrev}
                    variant="outline"
                    size="sm"
                    aria-label={`Go to previous page, page ${currentPage - 1}`}
                    _focus={{
                        outline: '2px solid',
                        outlineColor: 'blue.500',
                        outlineOffset: '2px',
                    }}
                    _disabled={{
                        opacity: 0.5,
                        cursor: 'not-allowed',
                    }}
                >
                    Previous
                </Button>

                <ol style={{ display: 'flex', gap: '0.5rem', listStyle: 'none', margin: 0, padding: 0 }}>
                    {pageNumbers.map((pageNum, index) => {
                        if (pageNum === '...') {
                            return (
                                <li key={`ellipsis-${index}`}>
                                    <Text px="2" aria-hidden="true" role="presentation">
                                        ...
                                    </Text>
                                </li>
                            );
                        }

                        const page = Number(pageNum);
                        const isCurrent = currentPage === page;
                        return (
                            <li key={page}>
                                <Button
                                    onClick={() => onPageChange(page)}
                                    variant={isCurrent ? 'solid' : 'outline'}
                                    colorScheme={isCurrent ? 'blue' : 'gray'}
                                    size="sm"
                                    py={2}
                                    px={3}
                                    aria-label={isCurrent ? `Current page, page ${page}` : `Go to page ${page}`}
                                    aria-current={isCurrent ? 'page' : undefined}
                                    _focus={{
                                        outline: '2px solid',
                                        outlineColor: 'blue.500',
                                        outlineOffset: '2px',
                                    }}
                                >
                                    {page}
                                </Button>
                            </li>
                        );
                    })}
                </ol>

                <Button
                    py={2}
                    px={3}
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!canGoNext}
                    variant="outline"
                    size="sm"
                    aria-label={`Go to next page, page ${currentPage + 1}`}
                    _focus={{
                        outline: '2px solid',
                        outlineColor: 'blue.500',
                        outlineOffset: '2px',
                    }}
                    _disabled={{
                        opacity: 0.5,
                        cursor: 'not-allowed',
                    }}
                >
                    Next
                </Button>
            </HStack>
        </nav>
    );
};

export default PaginationControls;
