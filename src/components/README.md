# Iconbuddy Icon Component

This directory contains the Icon component and related utilities for using **Iconbuddy** (https://iconbuddy.com) icons throughout the Jobty project.

## Overview

The Icon component (`Icon.jsx`) loads SVG icons dynamically from Iconbuddy's CDN, providing a lightweight, scalable icon system without bundling large icon libraries.

## Installation & Setup

No additional packages required—the component uses native `fetch` to load SVGs from Iconbuddy's public CDN.

## Usage

### Basic Usage

```jsx
import Icon from './components/Icon';

export default function MyComponent() {
  return (
    <div>
      <Icon name="search" collection="lucide" size={24} color="#4f46e5" />
      <Icon name="heart" size={20} />
      <Icon name="menu" collection="heroicons" size={32} />
    </div>
  );
}
```

### Using Icon Mappings (Recommended)

```jsx
import Icon from './components/Icon';
import { getIconProps, ICON_SIZES } from './components/iconMapping';

export default function SearchBar() {
  return (
    <div>
      <Icon {...getIconProps('search', ICON_SIZES.md, '#666')} />
      <Icon {...getIconProps('heart')} />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | string | required | Icon name from Iconbuddy |
| `collection` | string | `'lucide'` | Icon collection (lucide, heroicons, feather, tabler, etc.) |
| `size` | number | `24` | Icon size in pixels |
| `color` | string | `'currentColor'` | Icon color (CSS color value) |
| `className` | string | `''` | Additional CSS classes |
| `style` | object | `{}` | Additional inline styles |

## Available Collections

- **lucide**: Modern, minimalist icons (~5000 icons)
- **heroicons**: Accessible, professional icons (~1000 icons)
- **feather**: Minimal line icons (~300 icons)
- **tabler**: Customizable, comprehensive icons (~5000 icons)

Browse icons at: https://iconbuddy.com

## Icon Mapping

The `iconMapping.js` file provides:

- `ICON_NAMES`: Predefined icon mappings for common Jobty use cases
- `getIconProps()`: Helper function to retrieve icon props by name
- `ICON_SIZES`: Standard size constants (xs, sm, md, lg, xl, 2xl)

### Example: Adding a New Icon

Edit `iconMapping.js`:

```javascript
export const ICON_NAMES = {
  // ... existing icons
  myNewIcon: { name: 'my-icon-name', collection: 'lucide' },
};
```

Then use it:

```jsx
<Icon {...getIconProps('myNewIcon')} />
```

## Migration from react-icons

### Before (react-icons)

```jsx
import { FiSearch, FaHeart } from 'react-icons/fi';

export default function MyComponent() {
  return (
    <div>
      <FiSearch size={24} color="#4f46e5" />
      <FaHeart size={20} color="red" />
    </div>
  );
}
```

### After (Iconbuddy)

```jsx
import Icon from './components/Icon';
import { getIconProps } from './components/iconMapping';

export default function MyComponent() {
  return (
    <div>
      <Icon {...getIconProps('search', 24, '#4f46e5')} />
      <Icon {...getIconProps('heart', 20, 'red')} />
    </div>
  );
}
```

## Performance Considerations

- Icons are **fetched on-demand** from Iconbuddy's CDN (cached by browser).
- For frequently-used icons, consider storing SVGs locally in `public/icons/` and importing them directly as React components.
- The component uses `useEffect` to load SVGs asynchronously, so there's no render-blocking.

## Fallbacks & Error Handling

- If an icon is not found, the component logs a warning and renders an info icon as fallback.
- Network errors are caught and logged to the browser console.

## Best Practices

1. Use `iconMapping.js` for consistency across components.
2. Define custom icon mappings in `iconMapping.js` before using them.
3. For accessibility, provide `aria-label` or wrap icons with descriptive text:
   ```jsx
   <button aria-label="Search">
     <Icon {...getIconProps('search')} />
   </button>
   ```
4. Use standard sizes from `ICON_SIZES` for visual consistency.

## Resources

- Iconbuddy: https://iconbuddy.com
- Lucide Icons: https://lucide.dev
- Heroicons: https://heroicons.com
