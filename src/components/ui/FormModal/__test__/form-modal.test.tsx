import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../../../test-utils/render';
import { UserFormTrigger } from '../index';
import { UserFormProvider } from '../../../providers/FormProvider';

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

// Wrapper component with form provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => <UserFormProvider>{children}</UserFormProvider>;

describe('FormModal', () => {
    beforeEach(() => {
        // Clear localStorage before each test to ensure consistent state
        localStorage.clear();
        // Clear mock functions
        mockPush.mockClear();
        mockReplace.mockClear();
        mockSearchParams.delete('openModal');
    });

    it('renders trigger button and opens modal', async () => {
        render(
            <TestWrapper>
                <UserFormTrigger>
                    <button>Get Started</button>
                </UserFormTrigger>
            </TestWrapper>
        );

        const triggerButton = screen.getByText('Get Started');
        expect(triggerButton).toBeInTheDocument();

        fireEvent.click(triggerButton);

        await waitFor(() => {
            expect(screen.getByText('Get Started')).toBeInTheDocument();
        });
    });

    it('renders form fields when modal is open', async () => {
        render(
            <TestWrapper>
                <UserFormTrigger>
                    <button>Open Modal</button>
                </UserFormTrigger>
            </TestWrapper>
        );

        const triggerButton = screen.getByText('Open Modal');
        fireEvent.click(triggerButton);

        await waitFor(() => {
            expect(screen.getByLabelText('Username')).toBeInTheDocument();
            expect(screen.getByLabelText('Job Title')).toBeInTheDocument();
        });
    });

    it('submit button is disabled when form is invalid', async () => {
        render(
            <TestWrapper>
                <UserFormTrigger>
                    <button>Open Modal</button>
                </UserFormTrigger>
            </TestWrapper>
        );

        const triggerButton = screen.getByText('Open Modal');
        fireEvent.click(triggerButton);

        await waitFor(() => {
            const saveButton = screen.getByText('Save');
            expect(saveButton).toBeDisabled();
        });
    });

    it('submit button is enabled when required fields are filled', async () => {
        render(
            <TestWrapper>
                <UserFormTrigger>
                    <button>Open Modal</button>
                </UserFormTrigger>
            </TestWrapper>
        );

        const triggerButton = screen.getByText('Open Modal');
        fireEvent.click(triggerButton);

        await waitFor(() => {
            expect(screen.getByLabelText('Username')).toBeInTheDocument();
        });

        const usernameInput = screen.getByLabelText('Username');
        const jobTitleInput = screen.getByLabelText('Job Title');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(jobTitleInput, { target: { value: 'developer' } });

        await waitFor(() => {
            const saveButton = screen.getByText('Save');
            expect(saveButton).not.toBeDisabled();
        });
    });

    it('modal closes when cancel button is clicked', async () => {
        render(
            <TestWrapper>
                <UserFormTrigger>
                    <button>Open Modal</button>
                </UserFormTrigger>
            </TestWrapper>
        );

        const triggerButton = screen.getByText('Open Modal');
        fireEvent.click(triggerButton);

        await waitFor(() => {
            expect(screen.getByText('Get Started')).toBeInTheDocument();
        });

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        await waitFor(() => {
            const modalTitles = screen.queryAllByText('Get Started');
            const profileTitles = screen.queryAllByText('User Profile');
            // Only the trigger button should remain
            expect(modalTitles.length + profileTitles.length).toBeLessThanOrEqual(1);
        });
    });

    it('renders custom children in trigger', () => {
        render(
            <TestWrapper>
                <UserFormTrigger>
                    <div>Custom Content</div>
                </UserFormTrigger>
            </TestWrapper>
        );

        expect(screen.getByText('Custom Content')).toBeInTheDocument();
    });

    it('removes openModal query parameter when modal is closed', async () => {
        // Set up URL with openModal parameter
        mockSearchParams.set('openModal', 'true');

        render(
            <TestWrapper>
                <UserFormTrigger>
                    <button>Open Modal</button>
                </UserFormTrigger>
            </TestWrapper>
        );

        const triggerButton = screen.getByText('Open Modal');
        fireEvent.click(triggerButton);

        await waitFor(() => {
            expect(screen.getByText('Get Started')).toBeInTheDocument();
        });

        // Close modal by clicking cancel
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        // Verify that router.replace was called to remove the query parameter
        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith(window.location.pathname);
        });
    });

    it('removes openModal query parameter when form is submitted', async () => {
        // Set up URL with openModal parameter
        mockSearchParams.set('openModal', 'true');

        render(
            <TestWrapper>
                <UserFormTrigger>
                    <button>Open Modal</button>
                </UserFormTrigger>
            </TestWrapper>
        );

        const triggerButton = screen.getByText('Open Modal');
        fireEvent.click(triggerButton);

        await waitFor(() => {
            expect(screen.getByText('Get Started')).toBeInTheDocument();
        });

        // Fill form fields
        const usernameInput = screen.getByLabelText('Username');
        const jobTitleInput = screen.getByLabelText('Job Title');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(jobTitleInput, { target: { value: 'developer' } });

        // Submit form
        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        // Verify that router.replace was called to remove the query parameter
        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith(window.location.pathname);
        });
    });
});
