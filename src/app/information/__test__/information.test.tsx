import { screen } from '@testing-library/react';
import { render } from '../../../test-utils/render';
import { MockedProvider } from '@apollo/client/testing';
import Information from '../page';
import { UserFormProvider } from '@/components/providers/FormProvider';
import { GET_CHARACTERS } from '@/lib/graphql/queries';

// Mock Next.js navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
        prefetch: jest.fn(),
    }),
    useSearchParams: () => mockSearchParams,
}));

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Wrapper component with form provider and Apollo
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const mocks = [
        {
            request: {
                query: GET_CHARACTERS,
                variables: { page: 1 },
            },
            result: {
                data: {
                    characters: {
                        info: {
                            count: 2,
                            pages: 1,
                            next: null,
                            prev: null,
                        },
                        results: [
                            {
                                id: '1',
                                name: 'Rick Sanchez',
                                status: 'Alive',
                                species: 'Human',
                                type: '',
                                gender: 'Male',
                                origin: {
                                    id: '1',
                                    name: 'Earth (C-137)',
                                    type: 'Planet',
                                    dimension: 'Dimension C-137',
                                },
                                location: {
                                    id: '3',
                                    name: 'Citadel of Ricks',
                                    type: 'Space station',
                                    dimension: 'unknown',
                                    created: '2017-11-10T12:56:33.798Z',
                                },
                                image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
                                episode: [
                                    {
                                        id: '1',
                                        name: 'Pilot',
                                        air_date: 'December 2, 2013',
                                        episode: 'S01E01',
                                        created: '2017-11-10T12:56:33.798Z',
                                    },
                                ],
                                created: '2017-11-04T18:48:46.250Z',
                            },
                        ],
                    },
                },
            },
        },
    ];

    return (
        <MockedProvider mocks={mocks} addTypename={false}>
            <UserFormProvider>{children}</UserFormProvider>
        </MockedProvider>
    );
};

describe('Information Page', () => {
    beforeEach(() => {
        localStorage.clear();
        mockPush.mockClear();
        mockReplace.mockClear();
        mockSearchParams.delete('page');
    });

    test('renders information page title', () => {
        // Pre-populate localStorage with user data to prevent redirect
        const userData = {
            username: 'testuser',
            jobTitle: 'Developer',
        };
        localStorage.setItem('userFormData', JSON.stringify(userData));

        render(
            <TestWrapper>
                <Information />
            </TestWrapper>
        );

        expect(screen.getByText('Information Page')).toBeInTheDocument();
    });

    test('redirects to home with modal when no data exists', () => {
        render(
            <TestWrapper>
                <Information />
            </TestWrapper>
        );

        // Should redirect to home with openModal parameter
        expect(mockPush).toHaveBeenCalledWith('/?openModal=true');

        // Should not render the information page content when there's no data
        expect(screen.queryByText('Information Page')).not.toBeInTheDocument();
        expect(screen.queryByText('User Profile')).not.toBeInTheDocument();
    });

    test('shows user profile when data exists', () => {
        // Pre-populate localStorage with user data
        const userData = {
            username: 'testuser',
            jobTitle: 'Developer',
        };
        localStorage.setItem('userFormData', JSON.stringify(userData));

        render(
            <TestWrapper>
                <Information />
            </TestWrapper>
        );

        // User profile section has been removed, so these should not be present
        expect(screen.queryByText('User Profile')).not.toBeInTheDocument();
        expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();

        // But the welcome message should still be there
        expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();

        // And the Rick and Morty content should be present
        expect(screen.getByText('Rick and Morty Characters')).toBeInTheDocument();
    });
});
