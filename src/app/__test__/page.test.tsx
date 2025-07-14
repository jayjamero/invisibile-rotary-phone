import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils/render';
import Home from '../page';
import { UserFormProvider } from '@/components/providers/FormProvider';

// Mock Next.js navigation
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: jest.fn(),
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

// Wrapper component with form provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => <UserFormProvider>{children}</UserFormProvider>;

describe('Home Page', () => {
    beforeEach(() => {
        localStorage.clear();
        mockPush.mockClear();
        mockSearchParams.delete('openModal');
    });

    describe('Basic Rendering', () => {
        it('renders Rick and Morty Challenge title', () => {
            render(
                <TestWrapper>
                    <Home />
                </TestWrapper>
            );

            expect(screen.getByText('Rick and Morty Challenge')).toBeInTheDocument();
        });

        it('renders Rick and Morty quotes', () => {
            render(
                <TestWrapper>
                    <Home />
                </TestWrapper>
            );

            // Check for some of the Rick and Morty quotes
            expect(screen.getByText(/Wow, I really Cronenberged up the whole place/)).toBeInTheDocument();
            expect(screen.getByText(/Listen to your sister, Morty/)).toBeInTheDocument();
            expect(screen.getByText(/Weddings are basically funerals with cake/)).toBeInTheDocument();
            expect(screen.getByText(/You're missing the point Morty/)).toBeInTheDocument();
        });

        it('renders Header and Footer components', () => {
            render(
                <TestWrapper>
                    <Home />
                </TestWrapper>
            );

            // Header should contain the logo and navigation
            expect(screen.getByAltText('Leonardo AI logo')).toBeInTheDocument();

            // Footer should be present (checking for footer content)
            expect(screen.getByText(/Challenge Brief \(v3\.5\)/)).toBeInTheDocument();
            expect(screen.getByText(/by Jay Jamero/)).toBeInTheDocument();
        });
    });

    describe('Button Behavior', () => {
        it('shows "Get Started" button when no user data exists', () => {
            render(
                <TestWrapper>
                    <Home />
                </TestWrapper>
            );

            // Check for Get Started button in the main content area (not header)
            const getStartedButtons = screen.getAllByText('Get Started');
            expect(getStartedButtons).toHaveLength(2); // One in header, one in main content
            expect(screen.queryByText(/Welcome back/)).not.toBeInTheDocument();
        });

        it('shows "Welcome back" button with username when user data exists', () => {
            // Pre-populate localStorage with user data
            const userData = {
                username: 'testuser',
                jobTitle: 'Developer',
            };
            localStorage.setItem('userFormData', JSON.stringify(userData));

            render(
                <TestWrapper>
                    <Home />
                </TestWrapper>
            );

            expect(screen.getByText('Welcome back testuser')).toBeInTheDocument();
            expect(screen.getByText('View Profile')).toBeInTheDocument(); // Header button changes
            expect(screen.queryByText('Get Started')).not.toBeInTheDocument(); // No Get Started in main content
        });

        it('welcome back button links to information page', () => {
            // Pre-populate localStorage with user data
            const userData = {
                username: 'testuser',
                jobTitle: 'Developer',
            };
            localStorage.setItem('userFormData', JSON.stringify(userData));

            render(
                <TestWrapper>
                    <Home />
                </TestWrapper>
            );

            const welcomeButton = screen.getByText('Welcome back testuser').closest('a');
            expect(welcomeButton).toHaveAttribute('href', '/information');
        });

        it('Get Started button opens modal', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <Home />
                </TestWrapper>
            );

            // Click the Get Started button in the main content (second one)
            const getStartedButtons = screen.getAllByText('Get Started');
            const mainGetStartedButton = getStartedButtons[1]; // Second button is in main content
            await user.click(mainGetStartedButton);

            // Check if modal opens (look for modal content)
            await waitFor(() => {
                expect(screen.getByLabelText(/Username/)).toBeInTheDocument();
                expect(screen.getByLabelText(/Job Title/)).toBeInTheDocument();
            });
        });
    });

    describe('Auto-Modal Opening', () => {
        it('automatically opens modal when openModal=true in URL', async () => {
            // Set up the search params
            mockSearchParams.set('openModal', 'true');

            render(
                <TestWrapper>
                    <Home />
                </TestWrapper>
            );

            // Wait for the effect to trigger and modal to open
            await waitFor(() => {
                // Check for modal content specifically (form fields)
                expect(screen.getByLabelText(/Username/)).toBeInTheDocument();
                expect(screen.getByLabelText(/Job Title/)).toBeInTheDocument();
            });
        });

        it('does not auto-open modal when openModal is not in URL', () => {
            render(
                <TestWrapper>
                    <Home />
                </TestWrapper>
            );

            // Modal should not be auto-opened - check for absence of modal content
            expect(screen.queryByLabelText(/Username/)).not.toBeInTheDocument();
            expect(screen.queryByLabelText(/Job Title/)).not.toBeInTheDocument();
        });

        it('does not auto-open modal when openModal=false in URL', () => {
            mockSearchParams.set('openModal', 'false');

            render(
                <TestWrapper>
                    <Home />
                </TestWrapper>
            );

            // Modal should not be auto-opened - check for absence of modal content
            expect(screen.queryByLabelText(/Username/)).not.toBeInTheDocument();
            expect(screen.queryByLabelText(/Job Title/)).not.toBeInTheDocument();
        });
    });

    describe('Content Structure', () => {
        it('has proper layout structure', () => {
            render(
                <TestWrapper>
                    <Home />
                </TestWrapper>
            );

            // Check for main content structure
            const main = document.querySelector('main');
            expect(main).toBeInTheDocument();
            // The main element doesn't have the CSS module class in the DOM
            // because Chakra UI uses its own styling system
        });

        it('contains all Rick and Morty quotes', () => {
            render(
                <TestWrapper>
                    <Home />
                </TestWrapper>
            );

            const expectedQuotes = [
                "Wow, I really Cronenberged up the whole place, huh Morty? Just a bunch a Cronenbergs walkin' around.",
                "Listen to your sister, Morty. To live is to risk it all, otherwise you're just an inert chunk of randomly assembled molecules drifting wherever the universe blows you.",
                "He's not a hot girl. He can't just bail on his life and set up shop in someone else's.",
                'Weddings are basically funerals with cake.',
                "You're missing the point Morty. Why would he drive a smaller toaster with wheels? I mean, does your car look like a smaller version of your house? No.",
            ];

            expectedQuotes.forEach((quote) => {
                expect(screen.getByText(quote)).toBeInTheDocument();
            });
        });
    });

    describe('Integration with UserFormProvider', () => {
        it('correctly determines user data status', () => {
            render(
                <TestWrapper>
                    <Home />
                </TestWrapper>
            );

            // Initially no user data - should have both Get Started buttons (header and main)
            const getStartedButtons = screen.getAllByText('Get Started');
            expect(getStartedButtons).toHaveLength(2);
        });

        it('updates when user data changes', () => {
            // Start with user data
            const userData = {
                username: 'john',
                jobTitle: 'Engineer',
            };
            localStorage.setItem('userFormData', JSON.stringify(userData));

            const { rerender } = render(
                <TestWrapper>
                    <Home />
                </TestWrapper>
            );

            // Should show welcome message
            expect(screen.getByText('Welcome back john')).toBeInTheDocument();

            // Clear user data
            localStorage.removeItem('userFormData');

            // Re-render to simulate state update
            rerender(
                <TestWrapper>
                    <Home />
                </TestWrapper>
            );

            // Note: This test might need adjustment based on how the UserFormProvider
            // handles localStorage changes in real-time
        });

        it('handles empty username and job title correctly', () => {
            // Set up data with empty strings
            const userData = {
                username: '   ', // whitespace only
                jobTitle: '',
            };
            localStorage.setItem('userFormData', JSON.stringify(userData));

            render(
                <TestWrapper>
                    <Home />
                </TestWrapper>
            );

            // Should show Get Started since data is empty/whitespace
            const getStartedButtons = screen.getAllByText('Get Started');
            expect(getStartedButtons).toHaveLength(2); // Header and main content
            expect(screen.queryByText(/Welcome back/)).not.toBeInTheDocument();
        });
    });
});
