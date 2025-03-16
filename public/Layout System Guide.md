# Fairwinds RV App - Layout System Guide

This guide explains the layout system implemented in the Fairwinds RV App. The layout system provides a consistent structure for all pages in the application, making it easier to maintain and ensuring a uniform user experience.

## Core Layout Components

### PageLayout

The `PageLayout` component is the foundation of the layout system. It provides a consistent container for all pages, including:

- NavBar with title and optional back button
- Error boundary for error handling
- Consistent padding and margins
- Responsive container sizing

**Usage:**

```tsx
import PageLayout from '@/components/common/layout/PageLayout';

export default function YourPage() {
  return (
    <PageLayout
      title="Your Page Title"
      showBackButton={true} // Optional, defaults to false
      backUrl="/previous-page" // Optional, defaults to dashboard
    >
      {/* Your page content here */}
    </PageLayout>
  );
}
```

### ContentCard

The `ContentCard` component provides a consistent card-based container for content sections. It includes:

- Consistent card styling
- Optional title and description
- Flexible content area

**Usage:**

```tsx
import ContentCard from '@/components/common/layout/ContentCard';

<ContentCard
  title="Section Title" // Optional
  description="Section description text goes here." // Optional
>
  {/* Your card content here */}
</ContentCard>
```

### ButtonGrid

The `ButtonGrid` component provides a consistent grid layout for navigation buttons. It includes:

- Responsive grid layout
- Configurable number of columns
- Consistent spacing

**Usage:**

```tsx
import ButtonGrid from '@/components/common/navigation/ButtonGrid';
import NavButton from '@/components/common/navigation/NavButton';

<ButtonGrid columns={3}> {/* Optional, defaults to 3 */}
  <NavButton
    href="/some-page"
    label="Button Label"
    isPrimary={true} // Optional, defaults to false
    icon={<YourIcon />} // Optional
  />
  {/* More buttons... */}
</ButtonGrid>
```

## Visual Design System

### 1. Padding and Margins

The app uses a consistent spacing system for padding and margins to ensure visual harmony across all components.

#### Spacing Scale

We use a standardized spacing scale based on multiples of 4px:

| Variable | Size | Pixels | Usage |
|----------|------|--------|-------|
| --space-1 | 0.25rem | 4px | Minimal spacing, tight elements |
| --space-2 | 0.5rem | 8px | Default spacing between related elements |
| --space-3 | 0.75rem | 12px | Compact component padding |
| --space-4 | 1rem | 16px | Standard component padding (mobile) |
| --space-6 | 1.5rem | 24px | Standard component padding (desktop) |
| --space-8 | 2rem | 32px | Large spacing, section separation |

#### Standard Component Padding

- **Cards**: 1rem (16px) padding on mobile, 1.5rem (24px) on tablet/desktop
- **Buttons**: 0.5rem 0.75rem (8px 12px) on mobile, 0.75rem 1.5rem (12px 24px) on desktop
- **Form Fields**: 0.5rem (8px) vertical padding, 0.75rem (12px) horizontal padding

#### Element Margins

- **Between Cards**: Use the `content-section-spacing` class (1rem on mobile, 1.5rem on desktop)
- **Between Related Elements**: 0.5rem (8px) on mobile, 0.75rem (12px) on desktop
- **Between Form Fields**: 1rem (16px)

### 2. Vertical Spacing

Consistent vertical spacing creates a visual rhythm that guides users through the interface.

#### Standard Vertical Spacing Classes

- `content-section-spacing`: 1rem (16px) on mobile, 1.5rem (24px) on desktop
  - Use between major content sections (cards, forms, etc.)
- `space-y-2`: 0.5rem (8px) gap between child elements
  - Use for closely related elements within a component
- `space-y-4`: 1rem (16px) gap between child elements
  - Use for distinct elements within a component
- `space-y-6`: 1.5rem (24px) gap between child elements
  - Use for major sections within a page

#### Vertical Spacing Implementation

```tsx
// Between major content sections
<div className="content-section-spacing">
  <ContentCard title="Section 1">
    {/* Content */}
  </ContentCard>
</div>

// Between related elements
<div className="space-y-2">
  <p>First paragraph</p>
  <p>Second paragraph</p>
</div>
```

### 3. Horizontal Spacing

Horizontal spacing defines the relationship between elements on the same line and the distance from the page edge.

#### Container Padding

- Mobile: 1rem (16px) padding from screen edge
- Tablet/Desktop: 1.5rem (24px) padding from screen edge

#### Grid Gutters

- ButtonGrid: 0.5rem (8px) gap on mobile, 0.75rem (12px) on tablet, 1rem (16px) on desktop
- Content Grids: 0.5rem (8px) gap on mobile, 1rem (16px) on desktop

#### Inline Element Spacing

- Between inline elements: 0.5rem (8px)
- Icon + text: 0.5rem (8px)

### 4. Card Styling

Cards are the primary containers for content and should have consistent styling across the application.

#### Card Variants

- **Default**: White background, light gray border, subtle shadow
- **Primary**: Light blue background, blue border
- **Info**: Light gray background, gray border

#### Card Structure

- Consistent border radius: 0.5rem (8px)
- Consistent shadow: `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)`
- Border: 1px solid #E5E7EB (light gray)
- Padding: 1rem (16px) on mobile, 1.5rem (24px) on desktop

#### Card Implementation

```tsx
<ContentCard
  title="Card Title"
  variant="default" // or "primary" or "info"
>
  {/* Card content */}
</ContentCard>
```

### 5. Distance from Page Edge

All content should maintain a consistent distance from the page edge to create a balanced layout.

#### Container Width

- Maximum width: 64rem (1024px)
- Centered in the viewport with auto margins

#### Edge Padding

- Mobile: 1rem (16px) padding from screen edge
- Tablet/Desktop: 1.5rem (24px) padding from screen edge

#### Implementation

```tsx
<main className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 max-w-screen-md">
  {/* Page content */}
</main>
```

### 6. Typography

Typography should be consistent across the application to create a clear visual hierarchy.

#### Font Family

- Primary font: System font stack (native to user's device)
- Monospace font: For code or technical content

#### Type Scale

| Element | Mobile | Desktop | Weight | Color |
|---------|--------|---------|--------|-------|
| h1 | 1.5rem (24px) | 1.875rem (30px) | 600 | #8B4513 (Brown) |
| h2 | 1.25rem (20px) | 1.5rem (24px) | 600 | #8B4513 (Brown) |
| h3 | 1.125rem (18px) | 1.25rem (20px) | 600 | #8B4513 (Brown) |
| Body | 1rem (16px) | 1rem (16px) | 400 | #1D3557 (Navy) |
| Small | 0.875rem (14px) | 0.875rem (14px) | 400 | #1D3557 (Navy) |

#### Heading Classes

- `.heading`: Base heading style with brown color and appropriate font size
- Additional utility classes for specific heading levels

### 7. Color Scheme

The application uses a consistent color palette to create a cohesive visual experience.

#### Primary Colors

- Navy (#1D3557): Primary text color
- Brown (#8B4513): Heading color
- Blue (#2B6CB0): Primary action color
- Orange (#E76F51): Accent/hover color

#### Semantic Colors

- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)
- Info: Blue (#3B82F6)

#### Background Colors

- Page background: Linear gradient from #F5E6D3 to white
- Card background: White (#FFFFFF)
- Secondary background: Light gray (#F9FAFB)

#### Usage Guidelines

- Use navy for body text
- Use brown for headings
- Use blue for primary actions (primary buttons)
- Use orange for hover states and accents
- Use semantic colors for status indicators

### 8. Responsive Behavior

The application follows a mobile-first approach with consistent breakpoints for responsive design.

#### Breakpoints

- Small (sm): 640px and up (Tablet)
- Medium (md): 768px and up (Small desktop)
- Large (lg): 1024px and up (Desktop)

#### Responsive Patterns

- Single column layout on mobile
- Two column layout on tablet
- Three column layout on desktop (where appropriate)
- Increased padding and spacing on larger screens
- Larger typography on desktop for headings

#### Implementation

```tsx
// Example of responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Grid items */}
</div>
```

### 9. Component Sizing

Components should have consistent sizing across the application.

#### Button Sizing

- Full width on mobile (for primary actions)
- Auto width on desktop (minimum 8rem/128px)
- Height: 2.5rem (40px) on mobile, 3rem (48px) on desktop

#### Input Field Sizing

- Height: 2.5rem (40px)
- Full width within their container

#### Icon Sizing

- Navigation icons: 1.25rem (20px)
- Button icons: 1rem (16px)
- Indicator icons: 0.875rem (14px)

#### Card Sizing

- Full width on mobile
- Maximum width of 64rem (1024px) on desktop

### 10. Alignment

Consistent alignment creates a clean, organized interface.

#### Text Alignment

- Left-align body text and form labels
- Center-align page titles and section headings
- Right-align numeric values in tables

#### Component Alignment

- Center-align buttons in ButtonGrid
- Left-align form fields and labels
- Center-align the main container

#### Vertical Alignment

- Center-align icons with text
- Center-align items in navigation bars
- Top-align items in content cards

### 11. Visual Hierarchy

Visual hierarchy guides users through the interface by emphasizing important elements.

#### Size Hierarchy

- Larger elements are more important
- Page title > Section title > Content title
- Primary button > Secondary button

#### Color Hierarchy

- Primary actions use blue
- Secondary actions use gray
- Destructive actions use red
- Disabled elements use light gray

#### Spacing Hierarchy

- More important elements have more surrounding space
- Related elements are grouped with less space between them
- Unrelated elements have more space between them

#### Implementation

```tsx
// Example of visual hierarchy
<div>
  <h1 className="text-2xl font-semibold text-brown mb-4">Page Title</h1>
  <h2 className="text-xl font-medium text-brown mb-2">Section Title</h2>
  <p className="text-navy mb-4">Content text...</p>
  <div className="flex space-x-2">
    <button className="btn-primary">Primary Action</button>
    <button className="btn-secondary">Secondary Action</button>
  </div>
</div>
```

### 12. Consistency in UI Elements

UI elements should be consistent across the application to create a cohesive experience.

#### Button Styles

- Primary: Blue background, white text
- Secondary: White background, navy text, gray border
- Hover states: Orange background for primary, light gray for secondary

#### Form Controls

- Consistent input styling with light gray border
- Consistent focus states with blue outline
- Consistent error states with red border and error message

#### Navigation Elements

- NavBar: White background, shadow, centered title
- NavButton: Consistent styling with optional icon
- Back button: Left-aligned in NavBar

#### Interactive States

- Hover: Color change and subtle transform
- Focus: Blue outline
- Active: Darker color
- Disabled: Light gray, reduced opacity

## Page Structure Pattern

For consistency, all pages should follow this general structure:

```tsx
import PageLayout from '@/components/common/layout/PageLayout';
import ContentCard from '@/components/common/layout/ContentCard';
import ButtonGrid from '@/components/common/navigation/ButtonGrid';
import NavButton from '@/components/common/navigation/NavButton';

export default function YourPage() {
  return (
    <PageLayout
      title="Page Title"
      showBackButton={true}
      backUrl="/previous-page"
    >
      <ContentCard
        title="Section Title"
        description="Section description."
      >
        <ButtonGrid columns={3}>
          <NavButton
            href="/some-page"
            label="Button Label"
            isPrimary={true}
            icon={<YourIcon />}
          />
          {/* More buttons... */}
        </ButtonGrid>
      </ContentCard>
      
      {/* Additional content... */}
    </PageLayout>
  );
}
```

## Examples

### Dashboard Page

```tsx
<PageLayout title="Fairwinds RV Dashboard">
  <ButtonGrid columns={3}>
    <NavButton href="/rv" label="My RV" isPrimary />
    <NavButton href="/maintenance" label="Maintenance" />
    <NavButton href="/settings" label="Settings" />
  </ButtonGrid>
  
  <div className="content-section-spacing">
    <RVSummaryCard rv={userRV} />
  </div>
  
  <div className="mt-auto pt-4 pb-6 flex justify-center">
    <button onClick={signOut} className="...">
      Sign out
    </button>
  </div>
</PageLayout>
```

### Section Index Page

```tsx
<PageLayout
  title="My RV"
  showBackButton
  backUrl="/"
>
  <ContentCard
    title="RV Management"
    description="Manage your RV details and photos."
  >
    <ButtonGrid columns={3}>
      <NavButton href="/rv/profile" label="RV Profile" isPrimary />
      <NavButton href="/rv/photos" label="RV Photos" />
      <NavButton href="/" label="Back to Dashboard" />
    </ButtonGrid>
  </ContentCard>
</PageLayout>
```

## Adding New Pages

When adding new pages to the application:

1. Create a new file in the appropriate directory under `pages/`
2. Import the layout components
3. Structure your page using the pattern above
4. Add your page-specific content within the layout components

## Customizing the Layout

If you need to customize the layout for a specific page:

1. Use the existing layout components as a base
2. Add additional styling or components as needed
3. Maintain the overall structure for consistency

## Benefits of the Layout System

1. **Consistency**: All pages have the same structure and styling
2. **Maintainability**: Changes to layout can be made in one place
3. **Simplicity**: New pages can be created quickly with minimal code
4. **Responsiveness**: All components are responsive by default

## Conclusion

Using this layout system will ensure that the Fairwinds RV App has a consistent look and feel across all pages. It simplifies maintenance and development, especially for those with limited experience with Node.js or CSS.
