# Responsive Design Best Practices for Calnize

## Overview
This guide helps developers maintain and extend the responsive design system across the Calnize application.

## Core Principles

### 1. Mobile-First Approach
Always design and code for mobile first, then enhance for larger screens.

```css
/* ❌ Wrong - Desktop first */
.card {
  padding: 40px;  /* Desktop padding */
}
@media (max-width: 768px) {
  .card {
    padding: 16px;  /* Mobile override */
  }
}

/* ✅ Right - Mobile first */
.card {
  padding: 16px;  /* Mobile by default */
}
@media (min-width: 768px) {
  .card {
    padding: 40px;  /* Desktop enhancement */
  }
}
```

### 2. Use Responsive Utilities
Leverage the utility classes already defined in the system.

```jsx
// Use existing responsive classes
<div className="grid-responsive">
  {/* Automatically responsive: 1 col → 2 cols → 3 cols */}
</div>

<div className="flex-responsive">
  {/* Automatically responsive: column → row */}
</div>
```

### 3. CSS Variables for Spacing
Use the predefined CSS variables instead of hardcoding values.

```jsx
// ❌ Avoid hardcoding
<div style={{ padding: '32px' }}>Content</div>

// ✅ Use CSS variables
<div style={{ padding: 'var(--main-padding)' }}>Content</div>
```

Variables automatically adjust:
- `--main-padding`: 16px (mobile) → 32px (desktop)
- `--section-padding`: 24px (mobile) → 40px (desktop)
- `--gap-lg`: 16px (mobile) → 24px (desktop)

### 4. Responsive Typography with clamp()
Use `clamp()` for fluid typography that scales smoothly.

```css
/* Scales from 1rem to 1.5rem across all viewports */
h2 {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
}

/* For body text */
p {
  font-size: clamp(0.875rem, 1.5vw, 1rem);
}
```

## Breakpoint Reference

```
Mobile:          320px - 640px
Mobile Large:    641px - 767px
Tablet:          768px - 1023px
Desktop:         1024px - 1279px
Desktop Large:   1280px+
```

## Common Responsive Patterns

### 1. Responsive Grid
```jsx
<div className="grid-responsive">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

### 2. Responsive Flex
```jsx
<div className="flex-responsive">
  {/* Column on mobile, row on desktop */}
</div>
```

### 3. Conditional Visibility
```jsx
<nav className="mobile-visible">
  {/* Only visible on mobile */}
</nav>

<nav className="desktop-visible">
  {/* Only visible on desktop */}
</nav>
```

### 4. Stack on Mobile, Row on Desktop
```jsx
<div style={{
  display: 'flex',
  flexDirection: 'column', // Mobile
  gap: 'var(--gap-lg)',
}}>
  {/* Add media query for desktop */}
</div>

@media (min-width: 1024px) {
  div {
    flex-direction: row;
  }
}
```

## Component Guidelines

### Buttons
- **Mobile**: Minimum 44px height for touch targets
- **Padding**: 10px 16px (mobile) → 12px 24px (desktop)
- **Full width** on mobile only if primary CTA
- Never make buttons smaller than 40px × 40px

```jsx
<button className="btn-primary" style={{
  width: 'auto',  // Auto on desktop
  // Media query makes it 100% on mobile
}}>
  Action
</button>
```

### Forms
- **Full width** on mobile (100% - 32px padding)
- **Max width** 400px on desktop
- **Minimum height**: 44px for inputs/selects

```jsx
<input 
  className="input-field" 
  style={{
    width: '100%',
  }}
/>
```

### Cards
- **Padding**: 16px (mobile) → 24px (desktop)
- **Gap**: 12px (mobile) → 16px (desktop)
- **Margin**: Use `var(--gap-lg)`

```jsx
<div className="glass-card" style={{
  padding: 'var(--main-padding)',
  gap: 'var(--gap-lg)',
}}>
  Content
</div>
```

### Navigation
- **Mobile**: Hamburger menu, fixed header 60px
- **Desktop**: Sidebar 260px, full content width
- Use `MobileNav` component for dashboard

### Tables
- **Mobile**: Horizontal scroll with `-webkit-overflow-scrolling: touch`
- **Tablet**: May still need scroll if many columns
- **Desktop**: Full display

```jsx
<div className="responsive-table">
  <table>
    {/* Content automatically scrolls on small screens */}
  </table>
</div>
```

## Testing Requirements

Before committing responsive changes:

### Screen Sizes to Test
- [ ] 320px (iPhone SE)
- [ ] 375px (iPhone 12)
- [ ] 414px (iPhone 12 Pro Max)
- [ ] 480px (Android)
- [ ] 640px (iPad mini landscape)
- [ ] 768px (iPad portrait)
- [ ] 1024px (iPad landscape, small desktop)
- [ ] 1440px (desktop)
- [ ] 1920px (large desktop)

### Orientations
- [ ] Portrait (phones, tablets)
- [ ] Landscape (phones, tablets)

### Devices
- [ ] Chrome DevTools (all screen sizes)
- [ ] Firefox DevTools
- [ ] Safari DevTools
- [ ] Physical devices if possible

### Checklist
- [ ] No horizontal scrolling (except tables)
- [ ] Text is readable (16px minimum)
- [ ] Buttons are clickable (44px minimum)
- [ ] Images scale properly
- [ ] Navigation is accessible
- [ ] Forms are usable
- [ ] Content doesn't overflow
- [ ] Spacing looks balanced
- [ ] Colors have sufficient contrast

## Common Mistakes to Avoid

### ❌ Fixed Widths
```css
/* WRONG - Breaks on mobile */
.container {
  width: 1200px;
}
```

### ✅ Fluid Widths
```css
/* RIGHT - Adapts to screen */
.container {
  width: 100%;
  max-width: 1200px;
  padding: 0 var(--main-padding);
}
```

### ❌ Hardcoded Padding
```css
/* WRONG - Not responsive */
section {
  padding: 90px 28px;
}
```

### ✅ Using Variables
```css
/* RIGHT - Responsive */
section {
  padding: var(--section-padding);
}
```

### ❌ Inline Styles Only
```jsx
/* WRONG - Can't use media queries */
<div style={{ padding: '40px' }}>
```

### ✅ External CSS + Inline
```jsx
/* RIGHT - Use both */
<div style={{ padding: 'var(--main-padding)' }}>
```

### ❌ Non-Responsive Images
```jsx
/* WRONG - Fixed size */
<img src="image.jpg" width="800" height="600" />
```

### ✅ Responsive Images
```jsx
/* RIGHT - Flexible */
<img 
  src="image.jpg" 
  style={{ width: '100%', height: 'auto' }}
  alt="Description"
/>
```

## Adding Responsive Support to Existing Components

### Step 1: Identify the Component
Find the component file (e.g., `components/dashboard/Card.tsx`)

### Step 2: Remove Fixed Sizes
Replace hardcoded values with responsive alternatives:
```jsx
// Before
<div style={{ width: '400px', padding: '40px' }}>

// After
<div style={{ 
  width: '100%',
  maxWidth: '400px',
  padding: 'var(--main-padding)'
}}>
```

### Step 3: Add Media Queries if Needed
Create responsive styles for complex layouts:
```css
/* In corresponding CSS file */
@media (max-width: 768px) {
  .component-name {
    /* Mobile adjustments */
  }
}
```

### Step 4: Test on Multiple Devices
Use DevTools to verify responsiveness

### Step 5: Update Documentation
Add notes about responsive behavior to component docs

## Performance Tips

1. **Mobile-First CSS**: Smaller file size for mobile users
2. **Minimize Media Queries**: Use CSS variables instead of multiple overrides
3. **Optimize Images**: Use appropriate sizes for each device
4. **Lazy Load**: Load images below the fold lazily
5. **Monitor Performance**: Check Core Web Vitals regularly

## Maintenance Checklist

### Weekly
- [ ] Test new features on mobile
- [ ] Check DevTools for responsive issues

### Monthly
- [ ] Review responsive CSS for redundancy
- [ ] Test on new physical devices
- [ ] Check browser compatibility reports

### Quarterly
- [ ] Audit all pages for responsive compliance
- [ ] Update documentation if needed
- [ ] Performance review and optimization

## Resources

### Internal Files
- `app/globals.css` - Core responsive variables and utilities
- `app/dashboard/responsive-styles.css` - Dashboard specific styles
- `app/landing-responsive.css` - Landing page styles
- `components/dashboard/MobileNav.tsx` - Mobile navigation component

### External Resources
- [MDN Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries)
- [CSS Tricks Responsive Design](https://css-tricks.com/guides/responsive-design/)
- [Web.dev Responsive Web Design](https://web.dev/responsive-web-design-basics/)
- [Can I Use - Browser Support](https://caniuse.com/)

## Questions or Issues?

1. Check the `RESPONSIVE_DESIGN_GUIDE.md` for implementation details
2. Review existing responsive components for examples
3. Test on multiple devices using DevTools
4. Refer to CSS variables in `globals.css`

Remember: **Mobile-first, progressive enhancement, always test!**
