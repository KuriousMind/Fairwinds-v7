# Fairwinds RV App - Tech Stack Plan

## Tech Stack Components

### Frontend
- **Next.js 14**: React framework for the application (already implemented)
- **TypeScript**: For type safety and improved developer experience
- **Tailwind CSS**: For simplified styling and responsive design
- **Minimal Client Libraries**: Focus on built-in capabilities
- **Canvas API**: For client-side image processing

### Backend & Infrastructure (AWS Amplify Gen 2)
- **Authentication**: Cognito for user management (email/password)
- **Database**: DynamoDB with single-table design
- **Storage**: S3 for photo and document storage
- **API**: AppSync for GraphQL API
- **Hosting**: Amplify Hosting with CI/CD

## Cost-Saving Strategies

### Database Optimization
- Single-table design to minimize costs
- Efficient queries to reduce read/write units
- Minimal indexes and careful capacity planning

### Storage Efficiency
- Client-side image compression using Canvas API:
  * Auto-resize to max 1920px dimension (maintaining aspect ratio)
  * JPEG compression (quality: 0.8)
  * Native browser APIs only, no additional dependencies
- Maximum image size limit (effectively under 1MB per image after compression)
- Limited photo count per RV (12 photos maximum)

### API Optimization
- Implement client-side caching
- Batch related operations where possible
- Minimize unnecessary API calls

### Authentication Simplification
- Email/password authentication only initially
- Defer social login implementation

## Monthly Cost Estimate (Low User Base)

With AWS Amplify free tier and a small user base (under 100 users):
- **Hosting**: $0 (within free tier)
- **Authentication**: $0 (within free tier)
- **Database**: $0-5/month
- **Storage**: $0-2/month
- **API**: $0 (within free tier)

**Total Estimated Monthly Cost**: $0-10/month initially

## Data Model

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

## Implementation Priority

### Phase 1: Authentication & Basic Navigation (1-2 weeks)
- Basic user signup/login with email (already configured)
- Protected routes implementation
- Basic navigation structure
- Dashboard shell with placeholder components

### Phase 2: RV Profile (1-2 weeks)
- Single RV per user account
- RV profile creation and editing
- Basic required/optional field validation
- Photo upload with client-side compression
- Simple gallery view

### Phase 3: Maintenance Tracking (2-3 weeks)
- Basic maintenance records
- Simple date-based reminders
- Maintenance history view
- Document management for maintenance records

### Phase 4: PWA Features (1-2 weeks)
- Offline viewing capabilities:
  * Upcoming maintenance events
  * Basic RV information
  * Cached thumbnails (no offline editing in Phase 1)
- IndexedDB storage (50MB quota):
  * Maintenance events data (~1MB)
  * Thumbnail versions of latest photos (~3MB)
  * Remaining space for future features
- Install to home screen capability
- Simple offline data synchronization

## Development Approach for Solo Developer

### Start Small, Iterate Often
- Begin with core features only
- Release early to get feedback
- Add features incrementally

### Use Built-in Tools
- Leverage Amplify CLI for backend changes
- Use Next.js API routes for simple server functions
- Utilize TypeScript for catching errors early
- Use Canvas API for image processing (no additional libraries)

### Simplify Data Model
- Start with the defined schema (User, RV, MaintenanceRecord, Document)
- Single RV per user to reduce complexity
- Add fields and relationships as needed

### Mobile-First Implementation
- Card-based navigation layout
- Full-screen forms for data entry
- Grid/list layouts for galleries and records

### Progressive Enhancement
- Start with basic online-only functionality
- Add offline capabilities in Phase 4 when core features are stable
