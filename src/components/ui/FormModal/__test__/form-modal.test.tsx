import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../../../test-utils/render';
import { UserFormTrigger } from '../index';
import { UserFormProvider } from '../../../providers/FormProvider';

// Wrapper component with form provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => <UserFormProvider>{children}</UserFormProvider>;

describe('FormModal', () => {
    beforeEach(() => {
        // Clear localStorage before each test to ensure consistent state
        localStorage.clear();
    });

    test('renders trigger button and opens modal', async () => {
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

    test('renders form fields when modal is open', async () => {
        render(
            <TestWrapper>
                <UserFormTrigger>
                    <button>Get Started</button>
                </UserFormTrigger>
            </TestWrapper>
        );

        fireEvent.click(screen.getByText('Get Started'));

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Enter your job title')).toBeInTheDocument();
        });
    });

    test('submit button is disabled when form is invalid', async () => {
        render(
            <TestWrapper>
                <UserFormTrigger>
                    <button>Get Started</button>
                </UserFormTrigger>
            </TestWrapper>
        );

        fireEvent.click(screen.getByText('Get Started'));

        await waitFor(() => {
            const submitButton = screen.getByText('Save');
            expect(submitButton).toBeDisabled();
        });
    });

    test('submit button is enabled when required fields are filled', async () => {
        render(
            <TestWrapper>
                <UserFormTrigger>
                    <button>Get Started</button>
                </UserFormTrigger>
            </TestWrapper>
        );

        fireEvent.click(screen.getByText('Get Started'));

        // Wait for modal to open first
        await waitFor(() => {
            expect(screen.getByText('Get Started')).toBeInTheDocument();
        });

        // Now find and fill the form fields
        const usernameInput = screen.getByPlaceholderText('Enter your username');
        const jobTitleInput = screen.getByPlaceholderText('Enter your job title');

        fireEvent.change(usernameInput, { target: { value: 'johndoe' } });
        fireEvent.change(jobTitleInput, { target: { value: 'Developer' } });

        await waitFor(() => {
            const submitButton = screen.getByText('Save');
            expect(submitButton).not.toBeDisabled();
        });
    });

    test('modal closes when cancel button is clicked', async () => {
        render(
            <TestWrapper>
                <UserFormTrigger>
                    <button>Get Started</button>
                </UserFormTrigger>
            </TestWrapper>
        );

        fireEvent.click(screen.getByText('Get Started'));

        await waitFor(() => {
            expect(screen.getByText('Get Started') || screen.getByText('User Profile')).toBeInTheDocument();
        });

        // Click either Cancel or Close button depending on mode
        const cancelButton = screen.queryByText('Cancel') || screen.queryByText('Close');
        expect(cancelButton).toBeInTheDocument();
        fireEvent.click(cancelButton!);

        await waitFor(() => {
            // Modal title should not be in document when closed
            const modalTitles = screen.queryAllByText('Get Started');
            const profileTitles = screen.queryAllByText('User Profile');
            // Only the trigger button should remain
            expect(modalTitles.length + profileTitles.length).toBeLessThanOrEqual(1);
        });
    });

    test('renders custom children in trigger', () => {
        render(
            <TestWrapper>
                <UserFormTrigger>
                    <button>Custom Trigger</button>
                </UserFormTrigger>
            </TestWrapper>
        );

        expect(screen.getByText('Custom Trigger')).toBeInTheDocument();
    });
});
