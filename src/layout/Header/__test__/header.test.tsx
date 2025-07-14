import { screen } from '@testing-library/react';
import { render } from '../../../test-utils/render';
import { UserFormProvider } from '../../../components/providers/FormProvider';
import Header from '../';

describe('Header', () => {
    it('renders the logo and brand text', () => {
        render(
            <UserFormProvider>
                <Header />
            </UserFormProvider>
        );
        expect(screen.getByAltText(/Leonardo AI logo/)).toBeInTheDocument();
        expect(screen.getByText(/Rick and Morty/i)).toBeInTheDocument();
    });

    it('renders the menu items', () => {
        render(
            <UserFormProvider>
                <Header />
            </UserFormProvider>
        );
        expect(screen.getByText(/Information/i)).toBeInTheDocument();
        expect(screen.getByText(/Get Started/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /switch to (dark|light) mode/i })).toBeInTheDocument();
    });
});
