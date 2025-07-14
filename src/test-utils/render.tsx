import { Provider as ThemeProvider } from '../components/ui/ThemeProvider';
import { render as rtlRender } from '@testing-library/react';

export function render(ui: React.ReactNode) {
    return rtlRender(<>{ui}</>, {
        wrapper: (props: React.PropsWithChildren) => <ThemeProvider>{props.children}</ThemeProvider>,
    });
}
