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

## Benefits of the Layout System

1. **Consistency**: All pages have the same structure and styling
2. **Maintainability**: Changes to layout can be made in one place
3. **Simplicity**: New pages can be created quickly with minimal code
4. **Responsiveness**: All components are responsive by default

## Examples

### Dashboard Page

```tsx
<PageLayout title="Fairwinds RV Dashboard">
  <ButtonGrid columns={3}>
    <NavButton href="/rv" label="My RV" isPrimary />
    <NavButton href="/maintenance" label="Maintenance" />
    <NavButton href="/settings" label="Settings" />
  </ButtonGrid>
  
  <div className="mt-4 sm:mt-6">
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

## Conclusion

Using this layout system will ensure that the Fairwinds RV App has a consistent look and feel across all pages. It simplifies maintenance and development, especially for those with limited experience with Node.js or CSS.
