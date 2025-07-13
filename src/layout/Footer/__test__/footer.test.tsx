import { screen } from '@testing-library/react';
import { render } from '../../../test-utils/render';
import Footer from '../';

describe('Footer', () => {
    it('renders the footer text', () => {
        render(<Footer />);
        expect(screen.getByText(/Challenge Brief \(v3\.5\)/i)).toBeInTheDocument();
        expect(screen.getByText(/by Jay Jamero/i)).toBeInTheDocument();
    });
});
