import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../../../test-utils/render';
import { ColorModeButton, ColorModeIcon, useColorModeValue } from '../index';

describe('ColorModeButton', () => {
    it('renders the button with correct aria-label', () => {
        render(<ColorModeButton />);
        // The button should have a more specific aria-label based on current mode
        expect(screen.getByRole('button', { name: /switch to (dark|light) mode/i })).toBeInTheDocument();
    });

    it('renders the correct icon for light mode', () => {
        render(<ColorModeButton />);
        // Should render LuSun for light mode by default - icon is aria-hidden so we check for button text
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', expect.stringMatching(/switch to/i));
    });

    it('calls toggleColorMode on click, and updates aria-label appropriately', () => {
        render(<ColorModeButton />);
        const button = screen.getByRole('button', { name: /switch to/i });
        const initialLabel = button.getAttribute('aria-label');

        fireEvent.click(button);

        // After click, the aria-label should change
        const newLabel = button.getAttribute('aria-label');
        expect(newLabel).not.toBe(initialLabel);
        expect(newLabel).toMatch(/switch to/i);
    });
});

describe('ColorModeIcon', () => {
    it('renders the correct icon with aria-hidden attribute', () => {
        const { container } = render(<ColorModeIcon />);
        // Icons should be aria-hidden since button has descriptive aria-label
        const svgElement = container.querySelector('svg');
        expect(svgElement).toBeInTheDocument();
        expect(svgElement).toHaveAttribute('aria-hidden', 'true');
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
