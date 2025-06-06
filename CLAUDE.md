# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React/TypeScript web assistant component library built as a monorepo using pnpm workspaces. The project provides reusable UI components for chat/messaging interfaces with real-time WebSocket communication capabilities.

## Architecture

- **Monorepo Structure**: Uses pnpm workspaces with packages organized under `/packages/`
- **Component Library**: React/TypeScript components designed for web assistant interfaces
- **Build System**: Vite-based build configuration
- **Communication**: WebSocket service for real-time messaging

## Development Commands

- `pnpm install` - Install dependencies across all workspace packages
- `pnpm build` - Build the component library
- `pnpm dev` - Start development server (both client and server in parallel with graceful shutdown)
- `pnpm dev:client` - Start only the client development server
- `pnpm dev:server` - Start only the server development server
- `pnpm test` - Run tests (currently placeholder)

**Note**: The `pnpm dev` command includes graceful shutdown handling - use Ctrl+C to properly terminate all processes.

## Key Components

### Core Components (`packages/src/components/`)
- **Dialog.tsx**: Modal dialog component for conversations or settings
- **FloatButton.tsx**: Floating action button for triggering assistant interface
- **MessageList.tsx**: Component for displaying chat messages and conversation history

### Services (`packages/src/services/`)
- **websocket.ts**: WebSocket service for real-time communication with backend systems

### Entry Point
- **packages/src/index.ts**: Main export file for the component library

## Development Setup Requirements

This project requires the following to be functional:
1. React and TypeScript dependencies in package.json
2. Vite configuration in vite.config.ts
3. TypeScript configuration (tsconfig.json)
4. pnpm workspace configuration
5. Build and dev scripts in package.json

## Package Manager

Use `pnpm` (version 10.11.1) for all package management operations due to the workspace configuration.