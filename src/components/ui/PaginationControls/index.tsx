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
        <HStack gap="2" justify="center" wrap="wrap">
            <Button
                py={2}
                px={3}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!canGoPrev}
                variant="outline"
                size="sm"
            >
                Previous
            </Button>

            {pageNumbers.map((pageNum, index) => {
                if (pageNum === '...') {
                    return (
                        <Text key={`ellipsis-${index}`} px="2">
                            ...
                        </Text>
                    );
                }

                const page = Number(pageNum);
                return (
                    <Button
                        key={page}
                        onClick={() => onPageChange(page)}
                        variant={currentPage === page ? 'solid' : 'outline'}
                        colorScheme={currentPage === page ? 'blue' : 'gray'}
                        size="sm"
                        py={2}
                        px={3}
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
            >
                Next
            </Button>
        </HStack>
    );
};

export default PaginationControls;
