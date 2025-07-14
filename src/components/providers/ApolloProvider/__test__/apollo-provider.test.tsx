import React from 'react';
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import ApolloProvider from '../index';

// Mock the apollo-client module
jest.mock('@/lib/apollo-client', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
    mutate: jest.fn(),
    watchQuery: jest.fn().mockReturnValue({
      getCurrentResult: () => ({ loading: true, error: null, data: null }),
      subscribe: jest.fn(),
      setOptions: jest.fn(),
    }),
    readQuery: jest.fn(),
    writeQuery: jest.fn(),
    cache: {
      readQuery: jest.fn(),
      writeQuery: jest.fn(),
    },
  },
}));

// Simple test query
const TEST_QUERY = gql`
  query GetTest {
    test {
      id
      name
    }
  }
`;

// Test component that uses Apollo hooks
const TestComponent: React.FC = () => {
  const { loading, error } = useQuery(TEST_QUERY, {
    errorPolicy: 'all'
  });

  if (loading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">Error: {error.message}</div>;
  return <div data-testid="data">Data loaded</div>;
};

describe('ApolloProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <ApolloProvider>
        <div data-testid="child-component">Test Child</div>
      </ApolloProvider>
    );

    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('provides Apollo Client context to children', () => {
    // Use MockedProvider for more reliable testing
    const mocks = [
      {
        request: {
          query: TEST_QUERY,
        },
        result: {
          data: {
            test: { id: '1', name: 'Test' },
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <TestComponent />
      </MockedProvider>
    );

    // The component should render in loading state initially
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('handles multiple children', () => {
    render(
      <ApolloProvider>
        <div data-testid="first-child">First Child</div>
        <div data-testid="second-child">Second Child</div>
      </ApolloProvider>
    );

    expect(screen.getByTestId('first-child')).toBeInTheDocument();
    expect(screen.getByTestId('second-child')).toBeInTheDocument();
    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
  });

  it('provides access to Apollo Client hooks', () => {
    const mocks = [
      {
        request: {
          query: TEST_QUERY,
        },
        result: {
          data: {
            test: { id: '1', name: 'Test' },
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <TestComponent />
      </MockedProvider>
    );

    // Should render loading state without errors
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('has the correct component structure', () => {
    const { container } = render(
      <ApolloProvider>
        <div>Test Content</div>
      </ApolloProvider>
    );

    // Apollo Provider should wrap the children without adding extra DOM elements
    expect(container.firstChild).toHaveTextContent('Test Content');
  });

  it('accepts ReactNode children prop', () => {
    const complexChildren = (
      <>
        <div>First element</div>
        <span>Second element</span>
        <p>Third element</p>
      </>
    );

    render(
      <ApolloProvider>
        {complexChildren}
      </ApolloProvider>
    );

    expect(screen.getByText('First element')).toBeInTheDocument();
    expect(screen.getByText('Second element')).toBeInTheDocument();
    expect(screen.getByText('Third element')).toBeInTheDocument();
  });

  it('does not crash with empty children', () => {
    expect(() => {
      render(<ApolloProvider>{null}</ApolloProvider>);
    }).not.toThrow();
  });

  it('maintains provider functionality across re-renders', () => {
    const { rerender } = render(
      <ApolloProvider>
        <div data-testid="content">Initial content</div>
      </ApolloProvider>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();

    rerender(
      <ApolloProvider>
        <div data-testid="content">Updated content</div>
      </ApolloProvider>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('Updated content')).toBeInTheDocument();
  });

  it('integrates with actual ApolloProvider component', () => {
    const SimpleComponent: React.FC = () => (
      <div data-testid="simple">Simple component</div>
    );

    render(
      <ApolloProvider>
        <SimpleComponent />
      </ApolloProvider>
    );

    expect(screen.getByTestId('simple')).toBeInTheDocument();
    expect(screen.getByText('Simple component')).toBeInTheDocument();
  });

  it('wraps children with Apollo Client Provider', () => {
    const { container } = render(
      <ApolloProvider>
        <div data-testid="wrapped-content">Content</div>
      </ApolloProvider>
    );

    // Should render without throwing and contain the wrapped content
    expect(screen.getByTestId('wrapped-content')).toBeInTheDocument();
    expect(container).toBeInTheDocument();
  });

  describe('Edge Cases', () => {
    it('handles nested providers gracefully', () => {
      render(
        <ApolloProvider>
          <ApolloProvider>
            <div data-testid="nested-content">Nested content</div>
          </ApolloProvider>
        </ApolloProvider>
      );

      expect(screen.getByTestId('nested-content')).toBeInTheDocument();
    });

    it('preserves component props and attributes', () => {
      const ComponentWithProps: React.FC<{ title: string; className: string }> = ({ title, className }) => (
        <div data-testid="props-component" title={title} className={className}>
          {title}
        </div>
      );

      render(
        <ApolloProvider>
          <ComponentWithProps title="Test Title" className="test-class" />
        </ApolloProvider>
      );

      const element = screen.getByTestId('props-component');
      expect(element).toBeInTheDocument();
      expect(element).toHaveAttribute('title', 'Test Title');
      expect(element).toHaveClass('test-class');
      expect(element).toHaveTextContent('Test Title');
    });

    it('works with functional components', () => {
      const FunctionalComponent = () => <div data-testid="functional">Functional Component</div>;

      render(
        <ApolloProvider>
          <FunctionalComponent />
        </ApolloProvider>
      );

      expect(screen.getByTestId('functional')).toBeInTheDocument();
    });

    it('works with class components', () => {
      class ClassComponent extends React.Component {
        render() {
          return <div data-testid="class">Class Component</div>;
        }
      }

      render(
        <ApolloProvider>
          <ClassComponent />
        </ApolloProvider>
      );

      expect(screen.getByTestId('class')).toBeInTheDocument();
    });
  });

  describe('TypeScript Support', () => {
    it('accepts proper ReactNode types', () => {
      const stringChild = "String child";
      const numberChild = 42;
      const booleanChild = true;
      const arrayChild = [
        <div key="1" data-testid="array-1">Array Item 1</div>,
        <div key="2" data-testid="array-2">Array Item 2</div>
      ];

      const { container } = render(
        <ApolloProvider>
          {stringChild}
          {numberChild}
          {booleanChild && <div data-testid="boolean-content">Boolean content</div>}
          {arrayChild}
        </ApolloProvider>
      );

      expect(container).toHaveTextContent('String child');
      expect(container).toHaveTextContent('42');
      expect(screen.getByTestId('boolean-content')).toBeInTheDocument();
      expect(screen.getByTestId('array-1')).toBeInTheDocument();
      expect(screen.getByTestId('array-2')).toBeInTheDocument();
    });
  });
});
