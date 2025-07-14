import React from 'react';
import { Skeleton, Card } from '@chakra-ui/react';

interface SkeletonCardProps {
    count?: number;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 1 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <Card.Root key={index} size="sm">
                    <Card.Body>
                        <Skeleton height="300px" borderRadius="md" mb="4" />
                        <Skeleton height="20px" width="70%" mb="2" />
                        <Skeleton height="16px" width="50%" mb="2" />
                        <Skeleton height="16px" width="60%" mb="2" />
                        <Skeleton height="16px" width="55%" />
                    </Card.Body>
                </Card.Root>
            ))}
        </>
    );
};

export default SkeletonCard;
