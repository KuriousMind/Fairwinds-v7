# Fairwinds RV App - Simplified Project Structure

## Implementation Phases Overview

- Phase 1: Authentication & Basic Navigation (1-2 weeks)
- Phase 2: RV Profile (1-2 weeks)
- Phase 3: Maintenance Tracking (2-3 weeks)
- Phase 4: PWA Features (1-2 weeks)

## Key Design Principles

- Card-based navigation with maximum three buttons per card
- Back navigation integrated within NavBar component
- Documents/photos displayed in grid/list layouts
- Single-purpose screens
- Full-screen forms for data entry
- Card-based content display for navigation elements
- Consistent navigation structure using NavBar and NavButton components

## Simplified Directory Structure

```
fairwinds/
├── public/                     # Static assets [PHASE 1]
│   ├── images/                # App images and icons [PHASE 1]
│   │   └── placeholders/     # Default/placeholder images [PHASE 2]
│   └── manifest.json          # PWA manifest [PHASE 4]
├── pages/                      # Next.js Pages Router [PHASE 1]
│   ├── _app.tsx               # App wrapper [PHASE 1]
│   ├── _document.tsx          # Document wrapper [PHASE 1]
│   ├── index.tsx              # Landing/Auth page [PHASE 1]
│   ├── dashboard.tsx          # Dashboard [PHASE 1]
│   ├── rv/                    # RV routes [PHASE 2]
│   │   ├── index.tsx          # RV main page [PHASE 2]
│   │   ├── profile.tsx        # RV profile [PHASE 2]
│   │   └── photos.tsx         # RV photos [PHASE 2]
│   ├── maintenance/           # Maintenance routes [PHASE 3]
│   │   ├── index.tsx          # Maintenance main page [PHASE 3]
│   │   ├── new.tsx            # New maintenance record [PHASE 3]
│   │   └── history.tsx        # Maintenance history [PHASE 3]
│   ├── settings.tsx           # Settings page [PHASE 3]
│   └── api/                   # API routes (if needed) [PHASE 3]
├── components/                 # React components
│   ├── auth/                  # Auth components [PHASE 1]
│   │   └── AuthProvider.tsx   # Cognito integration [PHASE 1]
│   ├── common/                # Shared components [PHASE 1]
│   │   ├── layout/           # Layout components [PHASE 1]
│   │   │   └── NavBar.tsx    # Navigation bar [PHASE 1]
│   │   ├── navigation/       # Navigation components [PHASE 1]
│   │   │   └── NavButton.tsx # Navigation button [PHASE 1]
│   │   └── ui/               # UI components [PHASE 1]
│   │       ├── LoadingState.tsx # Loading indicator [PHASE 1]
│   │       └── ErrorBoundary.tsx # Error handling [PHASE 1]
│   ├── dashboard/             # Dashboard components [PHASE 1]
│   │   └── RVSummaryCard.tsx  # RV summary on dashboard [PHASE 1]
│   ├── rv/                    # RV components [PHASE 2]
│   │   ├── RVProfile.tsx      # RV profile component [PHASE 2]
│   │   ├── RVProfileForm.tsx  # RV profile form [PHASE 2]
│   │   └── PhotoGallery.tsx   # Photo gallery [PHASE 2]
│   └── maintenance/           # Maintenance components [PHASE 3]
│       ├── MaintenanceForm.tsx # Maintenance form [PHASE 3]
│       └── MaintenanceCard.tsx # Maintenance card [PHASE 3]
├── lib/                        # Utility functions
│   ├── api/                   # API utilities [PHASE 1]
│   │   └── amplify.ts         # Amplify API setup [PHASE 1]
│   ├── auth/                  # Auth utilities [PHASE 1]
│   │   └── cognito.ts         # Cognito helpers [PHASE 1]
│   └── image/                 # Image processing utilities [PHASE 2]
│       └── compression.ts     # Canvas API compression [PHASE 2]
├── styles/                     # Global styles [PHASE 1]
│   └── globals.css            # Global CSS [PHASE 1]
├── types/                      # TypeScript types [PHASE 1]
│   └── models.ts              # Data model types [PHASE 1]
└── amplify/                    # AWS Amplify configuration [PHASE 1]
    ├── backend.ts             # Backend definition [PHASE 1]
    ├── auth/                  # Auth configuration [PHASE 1]
    │   └── resource.ts        # Auth resource [PHASE 1]
    └── data/                  # Data models [PHASE 1]
        └── resource.ts        # Data resource with schema [PHASE 1]
```

## Navigation Structure

### Main Navigation Structure

#### Dashboard (Main)

- Card with three navigation buttons:
  - Button 1: My RV - Access RV profile and photos
  - Button 2: Maintenance - View and manage maintenance records
  - Button 3: Settings - User preferences and app settings

#### My RV Section

- Navigation card with three buttons:
  - Button 1: Profile - View/edit RV details
  - Button 2: Photos - RV photo gallery
  - Button 3: Back - Return to dashboard
- Profile displays as full-screen form when editing
- Photos displayed in grid layout

#### Maintenance Section

- Navigation card with three buttons:
  - Button 1: New - Create maintenance record
  - Button 2: History - View maintenance records
  - Button 3: Back - Return to dashboard
- Records displayed in list layout
- Forms appear as full-screen overlays

### First-time User Flow [PHASE 1]

```
[/] (Root/Landing)
└── Landing Page
    ├── App Logo
    └── Authentication UI (Amplify Gen 2)
        ├── Login Form
        ├── Sign Up Form
        └── Password Reset
    
[/dashboard] (Protected Route)
└── Dashboard Shell
    └── {Components: NavBar with placeholder buttons}
```

### Returning User Flow

```
[/] (Root/Landing) [PHASE 1]
├── [Auth]
│   └── [/] - ACTIVE
└── [/dashboard] (Dashboard) [PHASE 1]
    └── {Components:
        - NavBar (3 buttons) - ACTIVE
        - RVSummaryCard - ACTIVE
        - MaintenancePreview - PLACEHOLDER
        - SettingsPanel - PLACEHOLDER
    }
    ├── [Button 1: /rv] (RV Section) [PHASE 2]
    │   └── {Components:
    │       - NavBar - ACTIVE
    │       - RVProfile - ACTIVE
    │   }
    │   ├── [/rv/profile] - ACTIVE
    │   ├── [/rv/photos] - ACTIVE
    │   └── [Back Navigation] - ACTIVE
    │
    ├── [Button 2: /maintenance] (Maintenance) [PHASE 3-PLACEHOLDER]
    │   └── {Components:
    │       - NavBar - ACTIVE
    │       - MaintenancePreview - PLACEHOLDER
    │       - MaintenanceCard - PLACEHOLDER
    │   }
    │   ├── [/maintenance/new] - PLACEHOLDER
    │   ├── [/maintenance/history] - PLACEHOLDER
    │   └── [Back Navigation] - ACTIVE
    │
    └── [Button 3: /settings] (Settings) [PHASE 3-PLACEHOLDER]
        └── {Components:
            - NavBar - ACTIVE
            - SettingsPanel - PLACEHOLDER
            - ErrorBoundary - ACTIVE
        }
```

## Component Implementation Status

### Phase 1: Authentication & Basic Navigation

- Landing Page Components
  - App Logo Display
  - Amplify Auth UI Integration
  - Protected Route Setup
- Authentication Implementation
  - Amplify Gen 2 Configuration
  - Email/Password Authentication
  - JWT Token Management
  - Session Handling
- Dashboard Shell
  - Basic NavBar Structure
  - Placeholder Navigation Buttons
  - Protected Route Implementation
- Common Components
  - NavBar (Basic Container)
  - ErrorBoundary
  - LoadingState

### Phase 2: RV Profile

- RV Components
  - RVProfile (Single RV per user)
  - RVProfileForm
    - Required fields: make (auto-complete), model (auto-complete), year (selection)
    - Optional fields: VIN, notes
  - PhotoGallery (Grid Layout, 12 photo limit)
  - PhotoUpload (Full-screen interface)
- Image Processing
  - Canvas API for client-side compression
  - Auto-resize to max 1920px dimension
  - JPEG compression (quality: 0.8)
  - No additional libraries needed

### Phase 3: Maintenance Tracking

- Maintenance Components
  - MaintenanceForm
  - MaintenanceHistory (List Layout)
  - MaintenanceCard
  - MaintenancePreview
- Settings Components
  - SettingsPanel
  - PreferencesForm

### Phase 4: PWA Features

- Offline Viewing Capabilities
  - Upcoming maintenance events
  - Basic RV information
  - Cached thumbnails (no offline editing)
- IndexedDB Storage (50MB quota)
  - Maintenance events data (~1MB)
  - Thumbnail versions of latest photos (~3MB)
  - Remaining space for future features
- Install to Home Screen Capability
- Simple Offline Data Synchronization

## Component Details

### Layout Components

- NavBar: Navigation container component
  - Manages layout and spacing of navigation buttons
  - Handles 3-button layout with integrated back navigation
  - Controls button visibility and arrangement
  - Maintains consistent card-based structure
- NavButton: Individual navigation button component
  - Handles button styling and interactions
  - Manages hover/active/focus states
  - Supports icons and metadata
  - Handles disabled states

### Dashboard Components

- RVSummaryCard: RV preview card on dashboard
  - Current RV information and status
  - Quick access to RV details
  - Status indicators and alerts

### RV Components

- RVProfile: Full-screen form for RV details
  - Single RV per user account
  - Required fields: make (auto-complete), model (auto-complete), year (selection)
  - Optional fields: VIN, notes
- RVProfileForm: Initial RV setup and editing
  - Auto-completing form using predefined make/model data
  - Year selection from predefined list
- PhotoGallery: Grid layout for photo management
  - Maximum 12 photos per RV
- PhotoUpload: Full-screen photo upload interface

### Maintenance Components

- MaintenanceForm: Full-screen form for new records
  - Photo attachment support
- MaintenanceHistory: List view with filtering
- MaintenanceCard: Individual record display
  - Photo display support

## Data Model

The application uses a simplified GraphQL schema with AWS Amplify Gen 2:

```graphql
type User @model {
  id: ID!
  email: String!
  rv: RV @hasOne
}

type RV @model {
  id: ID!
  make: String!
  model: String!
  year: Int!
  photos: [String]
  documents: [Document] @hasMany
  maintenanceRecords: [MaintenanceRecord] @hasMany
}

type MaintenanceRecord @model {
  id: ID!
  title: String!
  date: AWSDateTime!
  type: String!
  notes: String
  photos: [String]
  documents: [Document] @hasMany
}

type Document @model {
  id: ID!
  title: String!
  type: String!
  url: String!
  tags: [String]
}
```

This schema is defined in the Amplify data resource file and provides a clear starting point while maintaining the single-table design approach.

## API Implementation

### GraphQL API (AWS AppSync)

- Primary data interface using AppSync for all CRUD operations
- Implements the data models defined above
- Uses Amplify Gen 2 for simplified backend configuration

### API Security

- Cognito user pool authentication
- Fine-grained access control
- Per-field authorization rules

## Development Guidelines

### Deployment & Testing Strategy

- Deployment Workflow:
  - Git-based deployments through AWS Amplify
  - Automatic builds and deployments on git push
  - Built-in SSL and CDN management

### Testing Approach (Phase 1)

- Manual testing strategy focusing on:
  - Authentication flows
  - RV profile creation and editing
  - Photo upload functionality (12 photo limit)
  - Basic maintenance tracking

### File Naming Conventions

- Components: PascalCase (e.g., `MaintenanceCard.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useAuth.ts`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Pages: Next.js page convention (`index.tsx`, `profile.tsx`)

### Code Organization

- Keep related files close together
- Group by feature when possible
- Separate business logic from UI components
- Use barrel exports (index.ts) for cleaner imports

### Phase 1 Focus Areas

1. Core Authentication
2. Basic Navigation Structure
3. Dashboard Shell
4. Error Handling
5. Loading States

### Phase 2 Focus Areas

1. RV Profile Management
2. Photo Upload with Canvas API Compression
3. Gallery View

### Phase 3 Focus Areas

1. Maintenance Records
2. Maintenance History
3. Settings Management

### Phase 4 Focus Areas

1. Offline Viewing Capabilities
2. IndexedDB Storage
3. PWA Features

This simplified structure provides a foundation for Phase 1-4 features while maintaining a consistent user experience and smooth development progression. It focuses on simplicity for a new developer and cost-effective implementation.
