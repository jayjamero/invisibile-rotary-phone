import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../../../test-utils/render';
import { ColorModeButton, ColorModeIcon, useColorModeValue } from '../index';

describe('ColorModeButton', () => {
    it('renders the button with correct aria-label', () => {
        render(<ColorModeButton />);
        expect(screen.getByRole('button', { name: /toggle color mode/i })).toBeInTheDocument();
    });

    it('renders the correct icon for light mode', () => {
        render(<ColorModeButton />);
        // Should render LuSun for light mode by default
        expect(screen.getByTitle('Light mode')).toBeInTheDocument();
    });

    it('calls toggleColorMode on click, and sets theme to Dark Mode', () => {
        render(<ColorModeButton />);
        const button = screen.getByRole('button', { name: /toggle color mode/i });
        fireEvent.click(button);
        expect(screen.getByTitle('Dark mode')).toBeInTheDocument();
        // No error means toggleColorMode was called; actual theme change is handled by next-themes
    });
});

describe('ColorModeIcon', () => {
    it('renders the correct icon for dark mode', () => {
        render(<ColorModeIcon />);
        expect(screen.getByTitle('Dark mode')).toBeInTheDocument();
    });
});

describe('useColorModeValue', () => {
    // This is a hook, so we need to test it inside a component
    function TestComponent() {
        const value = useColorModeValue('light', 'dark');
        return <span>{value}</span>;
    }

    it('returns dark value by default', () => {
        render(<TestComponent />);
        expect(screen.getByText('dark')).toBeInTheDocument();
    });
});
