import {
    generatePageNumbers,
    canNavigateNext,
    canNavigatePrev,
    parsePageFromUrl,
    generatePageUrl,
} from '../pagination';

describe('Pagination Utilities', () => {
    describe('generatePageNumbers', () => {
        it('shows all pages when total pages is less than max visible', () => {
            const result = generatePageNumbers({
                currentPage: 2,
                totalPages: 3,
                maxVisiblePages: 5,
            });
            expect(result).toEqual([1, 2, 3]);
        });

        it('shows ellipsis near beginning', () => {
            const result = generatePageNumbers({
                currentPage: 2,
                totalPages: 10,
                maxVisiblePages: 5,
            });
            expect(result).toEqual([1, 2, 3, 4, '...', 10]);
        });

        it('shows ellipsis near end', () => {
            const result = generatePageNumbers({
                currentPage: 9,
                totalPages: 10,
                maxVisiblePages: 5,
            });
            expect(result).toEqual([1, '...', 7, 8, 9, 10]);
        });

        it('shows ellipsis in middle', () => {
            const result = generatePageNumbers({
                currentPage: 5,
                totalPages: 10,
                maxVisiblePages: 5,
            });
            expect(result).toEqual([1, '...', 4, 5, 6, '...', 10]);
        });

        it('uses default maxVisiblePages when not provided', () => {
            const result = generatePageNumbers({
                currentPage: 1,
                totalPages: 3,
            });
            expect(result).toEqual([1, 2, 3]);
        });
    });

    describe('canNavigateNext', () => {
        it('returns true when next is not null', () => {
            const info = { next: 'next-url', prev: null, pages: 5 };
            expect(canNavigateNext(info)).toBe(true);
        });

        it('returns false when next is null', () => {
            const info = { next: null, prev: 'prev-url', pages: 5 };
            expect(canNavigateNext(info)).toBe(false);
        });
    });

    describe('canNavigatePrev', () => {
        it('returns true when prev is not null', () => {
            const info = { next: null, prev: 'prev-url', pages: 5 };
            expect(canNavigatePrev(info)).toBe(true);
        });

        it('returns false when prev is null', () => {
            const info = { next: 'next-url', prev: null, pages: 5 };
            expect(canNavigatePrev(info)).toBe(false);
        });
    });

    describe('parsePageFromUrl', () => {
        it('parses valid page number', () => {
            expect(parsePageFromUrl('5')).toBe(5);
        });

        it('returns 1 for null input', () => {
            expect(parsePageFromUrl(null)).toBe(1);
        });

        it('returns 1 for empty string', () => {
            expect(parsePageFromUrl('')).toBe(1);
        });

        it('returns 1 for invalid number', () => {
            expect(parsePageFromUrl('invalid')).toBe(1);
        });

        it('returns 1 for negative number', () => {
            expect(parsePageFromUrl('-5')).toBe(1);
        });

        it('returns 1 for zero', () => {
            expect(parsePageFromUrl('0')).toBe(1);
        });
    });

    describe('generatePageUrl', () => {
        it('returns base path for page 1', () => {
            expect(generatePageUrl(1)).toBe('/information');
        });

        it('returns base path with custom path for page 1', () => {
            expect(generatePageUrl(1, '/custom')).toBe('/custom');
        });

        it('returns URL with page parameter for page > 1', () => {
            expect(generatePageUrl(3)).toBe('/information?page=3');
        });

        it('returns URL with page parameter and custom base path', () => {
            expect(generatePageUrl(2, '/custom')).toBe('/custom?page=2');
        });
    });
});
