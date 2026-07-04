# admin-web

Admin panel for the order-platform. Built with React 19, TypeScript, Vite, TanStack Query, and React Router.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Data fetching | TanStack Query (React Query) |
| Routing | React Router v7 |
| Auth | AWS Cognito |
| Testing | Vitest + Testing Library |
| Linting | ESLint + Prettier |

## Getting Started

```bash
# Install dependencies from the monorepo root
pnpm install

# Start dev server
pnpm --filter admin-web dev

# Run tests
pnpm --filter admin-web test

# Build for production
pnpm --filter admin-web build

# Lint
pnpm --filter admin-web lint
```

## Environment Variables

Create a `.env` file in this directory:

```env
VITE_COGNITO_REGION=us-east-1
VITE_COGNITO_CLIENT_ID=your-client-id
VITE_API_BASE_URL=http://localhost:4566
```

### Local mock authentication

Local development can bypass Cognito by explicitly enabling mock auth:

```env
VITE_AUTH_MODE=mock
VITE_MOCK_AUTH_PASSWORD=password123
```

Mock auth provides fixed users for `admin@example.local`, `operator@example.local`, and
`viewer@example.local`. `VITE_MOCK_AUTH_PASSWORD` is a shared local fixture exposed to the
Vite client bundle; do not treat it as a secret. Any `VITE_AUTH_MODE` value other than `mock`
keeps the real Cognito provider as the default.

## Project Structure

```
src/
├── components/     # Shared UI components
├── context/        # React contexts (auth)
├── hooks/          # Custom hooks (useAuth, data queries)
├── lib/            # SDK clients and utilities
├── pages/          # Route-level page components
├── providers/      # App providers (QueryClient, Auth)
├── routes/         # Route guards and wrappers
└── test/           # Test setup files
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start Vite dev server with HMR |
| `build` | Type-check and build for production |
| `preview` | Preview production build locally |
| `test` | Run Vitest tests |
| `test:watch` | Run tests in watch mode |
| `lint` | Run ESLint across the project |
