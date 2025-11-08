# Source Code Architecture

This document explains the project's folder structure following the Feature-Sliced Design methodology.

## Directory Structure

```
src/
├── app/                    # Application configuration
│   ├── providers/          # App-level providers
│   ├── layout/             # Main app layout
│   └── router/             # Main routing
├── entities/               # Business entities (user, role, cliente, etc.)
│   ├── user/
│   ├── role/
│   └── cliente/
├── features/               # Feature modules (self-contained functionality)
│   ├── administrativa/
│   │   ├── ui/             # UI components specific to feature
│   │   ├── lib/            # Feature-specific utilities
│   │   ├── model/          # Feature-specific state/logic
│   │   └── index.js        # Feature entry point
│   ├── comercial/
│   ├── contable/
│   ├── proyectos/
│   ├── soporte/
│   └── roles/
├── widgets/                # Complex cross-cutting components
│   ├── user-header/
│   ├── sidebar/
│   └── login-form/
├── pages/                  # Route-level components (views)
│   ├── administrativa/
│   ├── comercial/
│   ├── soporte/
│   ├── login/
│   └── home/
├── shared/                 # Shared utilities and generic components
│   ├── ui/                 # Generic UI components
│   ├── lib/                # Shared utilities
│   ├── hooks/              # Shared hooks
│   └── config/             # Configuration
└── assets/                 # Static assets (images, fonts, etc.)
```

## Architecture Principles

### 1. Shared Layer (`shared/`)
- Contains generic, reusable components that have no business logic
- Examples: Button, Input, Modal, LoadingSpinner, etc.
- Should not contain any business-specific logic

### 2. Entities Layer (`entities/`)
- Represents core business objects
- Examples: User, Role, Cliente entities with their related components
- Contains entity-specific business logic

### 3. Features Layer (`features/`)
- Self-contained business features
- Each feature is organized in subdirectories: ui/, model/, lib/
- Should be independently deployable if needed
- Contains business logic and UI components for specific functionality

### 4. Widgets Layer (`widgets/`)
- Cross-cutting UI components that compose multiple features
- Examples: UserHeader that shows user info and notifications
- Higher-level components that span multiple domains

### 5. Pages Layer (`pages/`)
- Route-level components that orchestrate features
- Should be thin and mainly composed of features and widgets
- Connect routing to features

## Naming Conventions

- Use PascalCase for React components (e.g., `UserTable.jsx`)
- Use camelCase for utility functions (e.g., `formatDate.js`)
- Use kebab-case for directory names (e.g., `user-management/`)
- Use index.js files to export components from each feature

## Migration Guide

If you're migrating from the old structure:
- Components that were in `components/common/` are now in `shared/ui/`
- View components that were in `views/` are now in `pages/`
- Feature-related components are now in `features/{feature-name}/ui/`
- Route-level components are now in `pages/`