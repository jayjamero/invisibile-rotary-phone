import { screen } from '@testing-library/react';
import { render } from '../../../test-utils/render';
import Information from '../page';
import { UserFormProvider } from '@/components/providers/FormProvider';

// Mock Next.js navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
        prefetch: jest.fn(),
    }),
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

// Wrapper component with form provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => <UserFormProvider>{children}</UserFormProvider>;

describe('Information Page', () => {
    beforeEach(() => {
        localStorage.clear();
        mockPush.mockClear();
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

        expect(screen.getByText('User Profile')).toBeInTheDocument();
        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(screen.getByText('Developer')).toBeInTheDocument();
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
        expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();
    });
});
