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
        <HStack gap="2" justify="center" wrap="wrap" as="nav" role="navigation" aria-label="Character pages navigation">
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

            {pageNumbers.map((pageNum, index) => {
                if (pageNum === '...') {
                    return (
                        <Text key={`ellipsis-${index}`} px="2" aria-hidden="true" role="presentation">
                            ...
                        </Text>
                    );
                }

                const page = Number(pageNum);
                const isCurrent = currentPage === page;
                return (
                    <Button
                        key={page}
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
                );
            })}

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
    );
};

export default PaginationControls;
