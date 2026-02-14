# shadcn/ui Integration & Styling Guide

## Overview

shadcn/ui has been successfully installed and configured for Jobty with a custom theme inspired by Connexion.css. The integration includes:

- **Tailwind CSS v4** with custom Jobty color palette
- **13+ shadcn UI components** (Button, Card, Input, Select, Label, Form, etc.)
- **CSS custom properties** for dynamic theming
- **Jobty Brand Colors:**
  - Primary: `#3DC7C9` (Cyan) - `rgb(61, 199, 201)`
  - Secondary: `#6852A3` (Purple) - `rgb(104, 82, 163)`
  - Base radius: `12px` (configurable via `--radius`)

## File Structure

```
src/
├── index.css                      # Tailwind directives + CSS custom properties
├── components/
│   └── ui/
│       ├── ShadcnButton.tsx       # Shadcn Button with variants (primary, secondary, ghost, etc.)
│       ├── Button.tsx             # Re-export of ShadcnButton
│       ├── Card.tsx               # Card container (20px border-radius)
│       ├── Input.tsx              # Form input (12px border-radius)
│       ├── Select.tsx             # Select dropdown (Radix UI)
│       ├── Label.tsx              # Form label
│       ├── Form.tsx               # React Hook Form wrapper
│       └── index.ts               # Centralized exports
├── lib/
│   └── utils.ts                   # cn(), clsx(), twMerge() utilities
└── features/
    └── auth/
        └── pages/
            ├── Connexion.tsx
            └── Connexion.css      # Original custom styling (preserved for reference)

tailwind.config.ts                 # Tailwind config with shadcn theme
components.json                    # shadcn CLI config
```

## Design Token Mapping

### Color System

All colors are defined as CSS custom properties in `src/index.css`:

```css
:root {
  --primary: 181 100% 49%;           /* #3DC7C9 - Jobty Cyan */
  --primary-foreground: 0 0% 100%;   /* White text on primary */
  --secondary: 259 42% 45%;          /* #6852A3 - Jobty Purple */
  --secondary-foreground: 0 0% 100%; /* White text on secondary */
  --accent: 180 60% 50%;             /* Alternative accent */
  --background: 0 0% 100%;           /* White */
  --foreground: 0 0% 20%;            /* Dark text */
  --destructive: 0 84% 60%;          /* Red for errors */
  --border: 0 0% 89%;                /* Light gray borders */
  --muted: 0 0% 90%;                 /* Disabled/muted elements */
  --radius: 12px;                    /* Base corner radius */
}
```

### Border Radius Scale

- Base radius: `12px` (inputs, buttons)
- Card radius: `20px` (hardcoded in Card component)
- Responsive: configurable via `--radius` CSS variable

### Typography

- Inherited from `index.css`: `Inter, system-ui, Avenir, Helvetica, Arial, sans-serif`
- Component defaults: 14px (labels), 15px (inputs), 16px (buttons)
- Font weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

## Component Usage

### Button

```tsx
import { Button } from "@/components/ui"

// Variants: default, secondary, destructive, outline, ghost, link
<Button variant="default">Login</Button>
<Button variant="secondary">Sign Up</Button>
<Button variant="ghost">Cancel</Button>

// Sizes: default, sm, lg, icon, pill
<Button size="pill">Get Started</Button>
<Button size="lg">Submit</Button>
```

**Styling Notes:**
- Primary buttons use `--primary` color (#3DC7C9)
- Hover state: `bg-primary/90`
- Pill size adds `rounded-full` + larger padding (32px)
- Inherits Connexion.css hover shadow: `shadow-0-6px-20px-rgba(61-199-201-0.4)`

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui"

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    Footer here
  </CardFooter>
</Card>
```

**Styling Notes:**
- Border radius: `20px` (Connexion.css card style)
- Padding: 24px by default (`p-6`)
- Shadow: `shadow-sm` (0 1px 2px 0 rgba(0,0,0,0.05))
- Border color: `--border` (light gray)

### Input

```tsx
import { Input } from "@/components/ui"

<Input type="email" placeholder="Enter email" />
<Input type="password" placeholder="Password" />
```

**Styling Notes:**
- Border radius: `12px` (Connexion.css input style)
- Padding: 10px 12px (Tailwind sm size)
- Focus state: `ring-2 ring-ring` + `border-primary`
- Border color on focus: `--primary` (#3DC7C9)

### Select

```tsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui"

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Choose option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

**Styling Notes:**
- Border radius: `12px` (matches Input)
- Dropdown arrow: Radix UI ChevronDown icon
- Open animation: `animate-in fade-in-0 zoom-in-95`

### Form (React Hook Form Integration)

```tsx
import { useForm } from "react-hook-form"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Button,
} from "@/components/ui"

export function MyForm() {
  const form = useForm()

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter email" {...field} />
              </FormControl>
              <FormMessage /> {/* Displays validation errors */}
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

## Tailwind CSS Classes Available

### Colors
- `text-primary` / `bg-primary` / `border-primary`
- `text-secondary` / `bg-secondary` / `border-secondary`
- `text-destructive` / `bg-destructive`
- `text-muted` / `bg-muted`
- `text-accent` / `bg-accent`

### Sizing & Spacing
```
p-2, p-3, p-4, p-6 (padding)
m-2, m-3, m-4 (margin)
gap-2, gap-4, gap-6 (gap between children)
```

### Responsive
```
md: (768px+)     // Desktop
sm: (640px+)     // Tablet
(no prefix) 0px  // Mobile first
```

### Borders & Radius
```
rounded-[12px]   // Uses CSS var --radius
border-[20px]    // Card-specific
border border-border  // Default border styling
```

## Migrating Pages to shadcn Components

### Before (Connexion.css custom form)
```tsx
<div className="connexion-form">
  <div className="form-group">
    <label>Email</label>
    <input type="email" placeholder="Your email" />
  </div>
  <button className="submit-btn">Login</button>
</div>
```

### After (shadcn Form)
```tsx
import { useForm } from "react-hook-form"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Button,
} from "@/components/ui"

export function LoginForm() {
  const form = useForm()

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="pill">
          Login
        </Button>
      </form>
    </Form>
  )
}
```

### Benefits:
- ✅ Built-in validation error display
- ✅ Consistent spacing via `space-y-6`
- ✅ Automatic focus management
- ✅ Accessible labels (htmlFor binding)
- ✅ Reduced CSS coupling

## Customization Guide

### Change Primary Color
Edit `src/index.css`:
```css
:root {
  --primary: 181 100% 49%; /* Change HSL values */
}
```

### Change Border Radius
Edit `tailwind.config.ts`:
```typescript
"--radius": "16px", // Instead of 12px
```

### Add New Color Variable
1. Add to `src/index.css` `:root`
2. Update `tailwind.config.ts` theme.extend.colors
3. Use in components: `className="bg-newcolor text-newcolor-foreground"`

## Performance Notes

- ✅ CSS custom properties support dynamic theme switching without JS
- ✅ Tailwind JIT compilation reduces unused CSS
- ✅ Shadcn components are headless (Radix UI) = minimal dependencies
- ✅ No JavaScript bloat from UI library (only as needed)

## Next Steps

1. **Migrate all form pages** (Connexion already has Connexion.css preserved)
   - Use Form + FormField components instead of raw inputs
   - Apply Button variants

2. **Replace card components** in marketplace.tsx
   - Use `<Card>` instead of custom divs
   - Use `<Badge>` for tags/labels

3. **Add more shadcn components** as needed:
   - `Dialog` / `AlertDialog` for modals
   - `Tabs` for tabbed content
   - `Pagination` for list pagination
   - `Tooltip` for help text
   - `Toast` for notifications

4. **Run build & lint**
   ```bash
   npm run build
   npm run lint
   ```

5. **Test responsive design**
   - Mobile (480px), Tablet (768px), Desktop (1024px+)

## Troubleshooting

### Styles not applying
- Check if Tailwind directives are in `src/index.css` (should show `@tailwind base/components/utilities`)
- Clear cache: `rm -rf node_modules/.vite`
- Restart dev server: `npm run dev`

### Color not matching design
- Verify HSL values in CSS custom properties
- Use browser DevTools to inspect computed `--primary` value
- Jigsaw/design tool to confirm HSL from hex

### Component not found
- Check `src/components/ui/index.ts` exports
- Verify import path: `import { Button } from "@/components/ui"`
- Ensure `@` alias is configured in `vite.config.ts`

## Resources

- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [React Hook Form](https://react-hook-form.com/)
