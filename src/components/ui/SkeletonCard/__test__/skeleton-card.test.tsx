import React from 'react';
import { render as customRender } from '@/test-utils/render';
import SkeletonCard from '../index';

describe('SkeletonCard', () => {
    it('renders a single skeleton card by default', () => {
        const { container } = customRender(<SkeletonCard />);
        const cards = container.querySelectorAll('.chakra-card__root');
        expect(cards).toHaveLength(1);
    });

    it('renders multiple skeleton cards when count is specified', () => {
        const { container } = customRender(<SkeletonCard count={3} />);
        const cards = container.querySelectorAll('.chakra-card__root');
        expect(cards).toHaveLength(3);
    });

    it('renders no cards when count is 0', () => {
        const { container } = customRender(<SkeletonCard count={0} />);
        const cards = container.querySelectorAll('.chakra-card__root');
        expect(cards).toHaveLength(0);
    });

    it('renders proper card structure', () => {
        const { container } = customRender(<SkeletonCard />);
        const card = container.querySelector('.chakra-card__root');
        expect(card).toBeInTheDocument();

        const skeletons = container.querySelectorAll('.chakra-skeleton');
        expect(skeletons.length).toBeGreaterThan(0);
    });
});
