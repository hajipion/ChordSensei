# Chord Training Application

## Overview

This is a full-stack web application for music chord training. The application allows users to practice chord recognition using visual color-coded flags and staff notation. Users can select specific chords to practice, set the number of rounds, and track their performance through interactive sessions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **UI Framework**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom chord color variables
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite with custom configuration for client-side development

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Style**: RESTful endpoints for session management
- **Development**: Hot module replacement via Vite integration
- **Storage**: In-memory storage with interface for future database integration

### Data Storage
- **Current**: In-memory storage using Map data structure
- **Schema**: Drizzle ORM with PostgreSQL schema definitions (ready for database integration)
- **Database Ready**: Configured for Neon Database with connection pooling

## Key Components

### Session Management
- **Session Creation**: POST `/api/sessions` - Creates new training sessions
- **Session Retrieval**: GET `/api/sessions/:id` - Fetches session data
- **Answer Tracking**: POST `/api/sessions/:id/answer` - Records user responses
- **Session Completion**: Automatic progression and completion tracking

### Chord System
- **Chord Data**: 14 predefined chords with Japanese names, colors, and musical notes
- **Color Coding**: Custom CSS variables for visual chord identification
- **Staff Notation**: SVG-based musical staff generation for chord display
- **Random Selection**: Algorithm for generating practice sequences

### User Interface
- **Home Page**: Chord selection and session configuration
- **Practice Page**: Interactive chord recognition interface
- **Results Page**: Performance analytics and session summary
- **Responsive Design**: Mobile-first approach with adaptive layouts

## Data Flow

1. **Session Initialization**: User selects chords and rounds on home page
2. **Session Creation**: Frontend sends configuration to backend API
3. **Practice Loop**: System presents random chords, user responds, results are tracked
4. **Progress Tracking**: Real-time updates to session state with each answer
5. **Completion**: Automatic transition to results page when all rounds completed
6. **Results Display**: Performance analytics with visual feedback

## External Dependencies

### UI Components
- **Radix UI**: Comprehensive component library for accessibility
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variants

### Data & State
- **TanStack Query**: Server state management with caching
- **Drizzle ORM**: Type-safe database operations
- **Zod**: Runtime type validation and schema parsing

### Development
- **Replit Integration**: Custom Vite plugins for development environment
- **ESBuild**: Fast bundling for production builds
- **TSX**: TypeScript execution for development server

### Audio
- **Tone.js**: Web Audio API framework for realistic piano sound synthesis
- **Audio Engine v1.0**: Basic Salamander Grand Piano sampler (archived in audio-engine-v1.ts)
- **Audio Engine v2.0**: Stable, optimized Salamander piano with 0.5s clean sound (CONFIRMED WORKING)
- **Salamander Grand Piano**: High-quality samples from Tone.js CDN
- **Chord Playback**: Real-time chord sound generation with no echo/reverb effects
- **Error Resolution**: Fixed unhandledrejection errors, stable audio playback achieved

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with Express backend
- **Hot Reload**: Automatic refresh for both client and server changes
- **Type Checking**: Continuous TypeScript validation

### Production
- **Build Process**: Vite builds client assets, ESBuild bundles server
- **Static Assets**: Client builds to `dist/public` directory
- **Server Bundle**: Single file output with external package dependencies
- **Environment**: NODE_ENV-based configuration switching

### Database Integration
- **Migration Ready**: Drizzle migrations configured for PostgreSQL
- **Connection Pooling**: Neon Database serverless driver integration
- **Schema Evolution**: Type-safe database schema management

## Recent Changes

**January 28, 2025**
- ✓ Audio Engine v2.0 confirmed as stable version with 0.5s clean piano sound
- ✓ Fixed all unhandledrejection runtime errors in audio system
- ✓ Enhanced five-line staff notation with professional music engraving standards
- ✓ Implemented precise note positioning, treble clef, stems, and ledger lines
- ✓ Replaced VexFlow with custom SVG implementation for reliable chord display
- ✓ Accurate note-to-staff positioning matching audio playback
- ✓ Successfully implemented VexFlow 5.0 with proper CDN integration and key notation
- ✓ Compact, centered staff notation with clean visual presentation

The application is designed with scalability in mind, featuring a clean separation between frontend and backend, type-safe data handling, and a modular component architecture that supports future enhancements and database integration.