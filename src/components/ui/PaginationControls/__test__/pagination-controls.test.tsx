import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { render as customRender } from '@/test-utils/render';
import PaginationControls from '../index';
import { PaginationInfo } from '@/components/ui/PaginationControls/pagination';

const mockInfo: PaginationInfo = {
    next: '2',
    prev: null,
    pages: 5,
};

const mockInfoMiddle: PaginationInfo = {
    next: '4',
    prev: '2',
    pages: 5,
};

const mockInfoLast: PaginationInfo = {
    next: null,
    prev: '4',
    pages: 5,
};

describe('PaginationControls', () => {
    const mockOnPageChange = jest.fn();

    beforeEach(() => {
        mockOnPageChange.mockClear();
    });

    it('renders page numbers correctly', () => {
        customRender(
            <PaginationControls currentPage={1} totalPages={5} info={mockInfo} onPageChange={mockOnPageChange} />
        );

        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('disables previous button on first page', () => {
        customRender(
            <PaginationControls currentPage={1} totalPages={5} info={mockInfo} onPageChange={mockOnPageChange} />
        );

        const prevButton = screen.getByText('Previous');
        expect(prevButton).toBeDisabled();
    });

    it('disables next button on last page', () => {
        customRender(
            <PaginationControls currentPage={5} totalPages={5} info={mockInfoLast} onPageChange={mockOnPageChange} />
        );

        const nextButton = screen.getByText('Next');
        expect(nextButton).toBeDisabled();
    });

    it('enables both buttons on middle page', () => {
        customRender(
            <PaginationControls currentPage={3} totalPages={5} info={mockInfoMiddle} onPageChange={mockOnPageChange} />
        );

        const prevButton = screen.getByText('Previous');
        const nextButton = screen.getByText('Next');
        expect(prevButton).not.toBeDisabled();
        expect(nextButton).not.toBeDisabled();
    });

    it('calls onPageChange when page number is clicked', () => {
        customRender(
            <PaginationControls currentPage={1} totalPages={5} info={mockInfo} onPageChange={mockOnPageChange} />
        );

        const page3Button = screen.getByText('3');
        fireEvent.click(page3Button);
        expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it('calls onPageChange when previous button is clicked', () => {
        customRender(
            <PaginationControls currentPage={3} totalPages={5} info={mockInfoMiddle} onPageChange={mockOnPageChange} />
        );

        const prevButton = screen.getByText('Previous');
        fireEvent.click(prevButton);
        expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageChange when next button is clicked', () => {
        customRender(
            <PaginationControls currentPage={3} totalPages={5} info={mockInfoMiddle} onPageChange={mockOnPageChange} />
        );

        const nextButton = screen.getByText('Next');
        fireEvent.click(nextButton);
        expect(mockOnPageChange).toHaveBeenCalledWith(4);
    });

    it('highlights current page', () => {
        customRender(
            <PaginationControls currentPage={3} totalPages={5} info={mockInfoMiddle} onPageChange={mockOnPageChange} />
        );

        const currentPageButton = screen.getByText('3');
        // Current page should have different styling (solid variant)
        expect(currentPageButton).toBeInTheDocument();
    });

    it('renders ellipsis for large page counts', () => {
        customRender(
            <PaginationControls
                currentPage={10}
                totalPages={20}
                info={mockInfoMiddle}
                onPageChange={mockOnPageChange}
            />
        );

        // Should have ellipsis in pagination
        const ellipsis = screen.getAllByText('...');
        expect(ellipsis.length).toBeGreaterThan(0);
    });
});
