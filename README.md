# Rick and Morty Challenge

A modern React application built with Next.js that displays Rick and Morty characters using the Rick and Morty API. Features a responsive design, accessibility-first approach, and comprehensive testing suite.

## 🚀 Features

- **Character Browser**: Browse Rick and Morty characters with pagination
- **Character Details**: View detailed information about each character
- **User Personalisation**: Save user preferences and personalised experience
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark Mode**: Toggle between light and dark themes
- **Accessibility**: WCAG 2.1 AA compliant with semantic HTML and ARIA support
- **SEO Optimised**: Meta tags, semantic markup, and PWA support
- **Type Safety**: Full TypeScript implementation

## 🛠 Tech Stack

- **Framework**: Next.js 15.3.5 (App Router)
- **React**: 19.0.0
- **UI Library**: Chakra UI v3.22.0
- **GraphQL**: Apollo Client 3.13.8
- **Styling**: Emotion React
- **Theme**: next-themes for dark mode
- **Testing**: Jest + React Testing Library
- **Language**: TypeScript 5
- **Linting**: ESLint 9 with Next.js config

## 📋 Prerequisites

- **Node.js**: v18.18.2 (use nvm for version management)
- **npm**: v9.8.1 or higher

## 🔧 Setup & Installation

### 1. Node Version Management

This project uses a specific Node.js version. Use nvm to ensure compatibility:

```bash
# Install nvm if you haven't already
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Use the project's Node version
nvm use

# If the version isn't installed, install it first
nvm install v18.18.2
nvm use v18.18.2
```

### 2. Install Dependencies

```bash
npm install
```

## 🏃‍♂️ Development

### Start Development Server

```bash
nvm use  # Ensure correct Node version
npm run dev
```

The application will be available at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run test suite

## 🧪 Testing

The project includes a comprehensive test suite with 121 tests across 13 test suites.

```bash
# Run all tests
nvm use && npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- --testPathPatterns="character-card.test.tsx"

# Run tests with coverage
npm test -- --coverage
```

### Test Coverage

- **Components**: All UI components have unit tests
- **Pages**: App pages are tested for rendering and functionality
- **Hooks**: Custom hooks are tested for behaviour
- **Providers**: Context providers are tested for state management
- **Utilities**: Helper functions and utilities are tested

## 🔍 Linting & Code Quality

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

The project uses:
- ESLint 9 with Next.js configuration
- TypeScript strict mode
- Prettier for code formatting (configured in `.prettierrc`)

## 🏗 Architecture

### Project Structure

```
leonardo-challenge-mero/
├── .github/                    # GitHub workflows and configs
├── .next/                      # Next.js build output
├── config/                     # Configuration files
│   └── CSSStub.js             # CSS stub for testing
├── public/                     # Static assets
│   ├── manifest.json          # PWA manifest
│   ├── leonardo-logo.svg      # Logo assets
│   └── *.svg                  # Icon assets
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── __test__/          # Page tests
│   │   └── information/       # Information page route
│   │       ├── page.tsx       # Information page
│   │       └── __test__/      # Information page tests
│   ├── components/            # Reusable components
│   │   ├── providers/         # Context providers
│   │   │   ├── ApolloProvider/     # GraphQL client provider
│   │   │   ├── FormProvider/       # Form state provider
│   │   │   └── ThemeProvider/      # Theme provider
│   │   └── ui/                # UI components
│   │       ├── CharacterCard/      # Character display card
│   │       ├── CharacterDetailModal/ # Character detail modal
│   │       ├── ColorMode/          # Dark mode toggle
│   │       ├── FormModal/          # User form modal
│   │       ├── PaginationControls/ # Pagination component
│   │       └── SkeletonCard/       # Loading skeleton
│   ├── hooks/                 # Custom React hooks
│   │   └── useRickAndMorty.ts # Rick and Morty API hook
│   ├── layout/                # Layout components
│   │   ├── Header/            # Site header
│   │   └── Footer/            # Site footer
│   ├── lib/                   # Libraries and utilities
│   │   ├── apollo-client.ts   # Apollo GraphQL client
│   │   └── graphql/           # GraphQL queries and types
│   │       ├── queries.ts     # GraphQL queries
│   │       └── types.ts       # TypeScript types
│   ├── styles/                # Styling utilities
│   │   └── accessibility.css  # Accessibility styles
│   └── test-utils/            # Testing utilities
│       ├── render.tsx         # Custom render for tests
│       └── fix-js-dom-environment.ts # Jest environment fix
├── .nvmrc                     # Node version specification
├── babel.test.config.js       # Babel config for tests
├── eslint.config.mjs          # ESLint configuration
├── jest.config.js             # Jest testing configuration
├── jest-setup.js              # Jest setup file
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies and scripts
└── tsconfig.json              # TypeScript configuration
```

### Architecture Patterns

#### **Component Architecture**
- **Atomic Design**: Components are organised by complexity (UI components, layout components, pages)
- **Container/Presentational**: Clear separation between data fetching and presentation
- **Co-location**: Tests are co-located with components for better maintainability

#### **State Management**
- **React Context**: User form data and app state
- **Apollo Client**: GraphQL state management and caching
- **Local State**: Component-specific state with React hooks

#### **Data Flow**
1. **GraphQL API**: Rick and Morty API via Apollo Client
2. **Custom Hooks**: `useRickAndMorty` for data fetching
3. **Context Providers**: Global state management
4. **Component Props**: Data flows down via props

#### **Accessibility Architecture**
- **Semantic HTML**: Proper HTML5 semantic elements throughout
- **ARIA Labels**: Comprehensive ARIA support for screen readers
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus handling in modals and interactions
- **Color Contrast**: Accessible color schemes

## 🌐 API Integration

The application integrates with the [Rick and Morty API](https://rickandmortyapi.com/) using GraphQL:

- **Endpoint**: `https://rickandmortyapi.com/graphql`
- **Queries**: Character listing with pagination
- **Caching**: Apollo Client provides automatic caching
- **Error Handling**: Comprehensive error boundaries and user feedback

## 📱 PWA Support

The application includes Progressive Web App features:
- Web app manifest (`public/manifest.json`)
- Responsive design
- Offline-ready architecture
- App-like experience on mobile devices

## 🔒 SEO & Performance

- **Meta Tags**: Comprehensive meta tag implementation
- **Semantic HTML**: Proper heading hierarchy and semantic elements
- **Open Graph**: Social media sharing optimisation
- **Sitemap**: Auto-generated sitemap for search engines
- **robots.txt**: Search engine crawling instructions
- **Core Web Vitals**: Optimised for performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and ensure tests pass: `nvm use && npm test`
4. Run linting: `npm run lint`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Create a Pull Request

## 📝 License

This project is private and part of a coding challenge.

## 👨‍💻 Author

**Jay Jamero** - Challenge Brief (v3.5)

---

Built with ❤️ using React, Next.js, and the Rick and Morty API
