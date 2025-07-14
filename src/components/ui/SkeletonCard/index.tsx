import React from 'react';
import { Skeleton, Card } from '@chakra-ui/react';

interface SkeletonCardProps {
    count?: number;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 1 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <Card.Root
                    key={index}
                    size="sm"
                    role="status"
                    aria-label={`Loading character card ${index + 1} of ${count}`}
                    aria-live="polite"
                >
                    <Card.Body>
                        <Skeleton height="300px" borderRadius="md" mb="4" aria-label="Loading character image" />
                        <Skeleton height="20px" width="70%" mb="2" aria-label="Loading character name" />
                        <Skeleton height="16px" width="50%" mb="2" aria-label="Loading character status" />
                        <Skeleton height="16px" width="60%" mb="2" aria-label="Loading character species" />
                        <Skeleton height="16px" width="55%" aria-label="Loading character location" />
                    </Card.Body>
                </Card.Root>
            ))}
        </>
    );
};

export default SkeletonCard;
