# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + Vite application with a custom UI component library (`@krds-ui/core`) and integration with TipTap rich text editor, Svar Grid, and Zustand state management. The project is structured as a monorepo with local packages.

## Development Commands

```bash
# Development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint

# Testing
npm run test              # Run all tests in watch mode
npm run test:ui          # Run tests with Vitest UI
npm run test:coverage    # Generate coverage report
```

## Project Structure

### Local Packages (Monorepo)

The project uses local packages linked via `file:` protocol in package.json:

- **`@krds-ui/core`** (`packages/core/`) - Main UI component library built with React + TypeScript + Tailwind CSS
  - Built components: Accordion, Badge, Body, Breadcrumb, Button, Calendar, Checkbox, Chip, CriticalAlert, Display, and more
  - Exports both ES and UMD modules
  - Has its own build process: `cd packages/core && npm run build`
  - TypeScript source in `packages/core/lib/`

- **`@krds-ui/icon`** (`packages/icon/`) - Icon component library

- **`@krds-ui/tailwindcss-plugin`** (`packages/tailwindcss-plugin/`) - Custom Tailwind CSS plugin used by core package

### Main Application Structure

- **`src/components/`** - React components
  - `RichEditor.jsx` - Complex TipTap-based WYSIWYG editor with table support, image/video embedding, YouTube integration, and HTML source view
  - `FileUpload.jsx` - File upload component
  - `Counter.jsx` - Example component using Zustand
  - `ui/Header.jsx`, `ui/Footer.jsx` - Layout components
  - `__tests__/` - Component tests using Vitest + React Testing Library

- **`src/context/`** - React Context providers
  - `AuthContext.jsx` - Authentication context with mock token management (see comments for production recommendations)

- **`src/store/`** - Zustand state management
  - `useCounterStore.js` - Example Zustand store

- **`styles/`** - Global styles
  - `output.css` - Generated Tailwind output
  - `krds_tokens.css` - Design tokens
  - `onCommon.css` - Common styles

## Key Technologies

- **React 18** with StrictMode
- **Vite 5** for build tooling
- **Vitest** for testing (configured with jsdom environment)
- **TipTap** for rich text editing (extensive integration in RichEditor.jsx)
- **Zustand** for state management
- **React Router 7** for routing
- **@svar-ui/react-grid** for data grid functionality
- **Axios** for HTTP requests

## Testing

- Test files use `.test.jsx` extension in `__tests__/` directories
- Vitest config: `vitest.config.js` with jsdom environment and path alias `@` → `./src`
- Run single test: `npm run test -- <filename>`
- Coverage reports exclude `node_modules/` and `dist/`

## Important Notes

- **Import aliases**: `@/` resolves to `src/` (configured in vitest.config.js)
- **KRDS UI**: Import components from `@krds-ui/core` and include `@krds-ui/core/dist/style.css`
- **AuthContext**: Currently uses mock authentication. See `src/context/AuthContext.jsx` comments for production security recommendations
- **RichEditor**: Highly configurable component with 30+ props controlling features like image upload, YouTube embedding, table editing, HTML source view, and theme switching
- **Local package development**: After modifying packages, rebuild them before testing in main app
