/**
 * Pagination utility functions
 */

export interface PaginationConfig {
    currentPage: number;
    totalPages: number;
    maxVisiblePages?: number;
}

export interface PaginationInfo {
    next: string | null;
    prev: string | null;
    pages: number;
}

/**
 * Generates page numbers for pagination with ellipsis logic
 */
export const generatePageNumbers = ({
    currentPage,
    totalPages,
    maxVisiblePages = 5,
}: PaginationConfig): (number | string)[] => {
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisiblePages) {
        // Show all pages if total is less than max visible
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        // Show pages with ellipsis logic
        const halfVisible = Math.floor(maxVisiblePages / 2);

        if (currentPage <= halfVisible + 1) {
            // Near beginning
            for (let i = 1; i <= maxVisiblePages - 1; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(totalPages);
        } else if (currentPage >= totalPages - halfVisible) {
            // Near end
            pages.push(1);
            pages.push('...');
            for (let i = totalPages - maxVisiblePages + 2; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // In middle
            pages.push(1);
            pages.push('...');
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(totalPages);
        }
    }

    return pages;
};

/**
 * Checks if navigation to next page is possible
 */
export const canNavigateNext = (info: PaginationInfo): boolean => {
    return info.next !== null;
};

/**
 * Checks if navigation to previous page is possible
 */
export const canNavigatePrev = (info: PaginationInfo): boolean => {
    return info.prev !== null;
};

/**
 * Parses page number from URL parameter
 */
export const parsePageFromUrl = (pageParam: string | null): number => {
    const page = parseInt(pageParam || '1', 10);
    return page > 0 ? page : 1;
};

/**
 * Generates URL for a given page
 */
export const generatePageUrl = (page: number, basePath: string = '/information'): string => {
    return page === 1 ? basePath : `${basePath}?page=${page}`;
};
