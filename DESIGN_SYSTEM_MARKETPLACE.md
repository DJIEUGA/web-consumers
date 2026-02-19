# Jobty Marketplace Design System

## Design Consistency Standards
**Created**: Feb 19, 2026  
**Purpose**: Ensure consistent UI implementation across the application

---

## Color Palette

### Primary Colors
- **Teal/Cyan Accent**: `#3DC7C9` - Used for buttons, CTAs, highlights, icons
- **Purple/Indigo**: `#6B4FC9` or `#5A4FC9` - Used for card headers (Freelance profiles)
- **Dark Gray/Slate**: `#1F2C2D` or `#2C3E50` - Headings, primary text
- **Light Gray**: `#5F6C6D` - Secondary text, labels
- **Background**: `#F7FBFB` or `#F0F9FA` - Page backgrounds (light teal tint)
- **Card Background**: `#FFFFFF` - White for profile cards
- **Danger/Red**: `#F44336` - Delete actions, warnings

---

## Profile Card Components

### Freelance Profile Card
```
┌─────────────────────────────────┐
│  [Purple Header Background]     │
│     [Avatar - overlapping]      │
├─────────────────────────────────┤
│  John Developer                 │
│  Full Stack Developer           │
│  📍 Location info               │
│                                 │
│  ⭐⭐⭐⭐⭐ (5.0)              │
│  +250 Projects                  │
│                                 │
│  [Skills Tags: React, Vue...]   │
│                                 │
│     [Contacter] Button          │
└─────────────────────────────────┘
```

**Layout Details:**
- Header Height: ~120-140px (Purple background)
- Avatar: 80px diameter, positioned at Y: -40px (overlapping header/content)
- Avatar Border: White, 3px solid
- Card Border Radius: 12-16px
- Shadow: Subtle (0 2px 8px rgba(0,0,0,0.08))

### Enterprise Profile Card
```
┌─────────────────────────────────┐
│ [Cover Image - large]           │
│     [Avatar - overlapping]      │
├─────────────────────────────────┤
│  Company Name                   │
│  Service Category               │
│  📍 Location                    │
│                                 │
│  ⭐⭐⭐⭐⭐ (4.8)              │
│  Service: Marketing             │
│                                 │
│     [Contacter] Button          │
└─────────────────────────────────┘
```

**Layout Details:**
- Cover Image Height: 150-180px (aspect ratio maintained)
- Avatar: Same as freelance (80px, overlapping)
- Content Padding: 16-20px

---

## Typography

| Element | Size | Weight | Color | Usage |
|---------|------|--------|-------|-------|
| Name | 16-18px | 700 | `#1F2C2D` | Profile name |
| Title | 13-14px | 500 | `#5F6C6D` | Professional title/category |
| Label | 12px | 500 | `#5F6C6D` | Secondary info |
| Rating | 14px | 600 | `#FFB800` | Star ratings |
| Count | 12px | 400 | `#5F6C6D` | Project/visit counts |

---

## Buttons & CTAs

### Primary Contact Button
- **Text**: "Contacter" (French)
- **Style**: Outlined/Ghost button
- **Border**: 1-2px solid `#3DC7C9`
- **Color**: `#3DC7C9`
- **Padding**: 10px 24px
- **Border Radius**: 999px (pill-shaped)
- **Hover**: Light background fill, slight shadow
- **Font Size**: 13-14px

### Filter Buttons
- Similar outlined style
- Smaller padding: 8px 16px
- Dropdown indicators where applicable

---

## Icons & Stars

### Rating Stars
- Size: 16-18px
- Color: `#FFB800` (Gold/Yellow)
- Display: "⭐⭐⭐⭐⭐ (5.0)" format
- Fallback: CSS star icon if unicode unavailable

### Icons
- Location: 📍 (pin emoji)
- Check mark: ✓ (for verification)
- Verified Badge: Teal checkmark or badge
- Status Icons: Various (online dot, etc.)

---

## Spacing & Layout

### Grid System
- **Card Grid**: 4 columns on desktop, 2 on tablet, 1 on mobile
- **Gap**: 24px between cards
- **Container Padding**: 20-32px
- **Card Padding**: 16-20px (content area)

### Spacing Units
- XS: 4px
- S: 8px
- M: 12-16px
- L: 20-24px
- XL: 32px

---

## Skills & Tags

- **Format**: Inline tags/chips
- **Style**: Light background (`#E7F6F7` or `#F0F9FA`), teal text
- **Border Radius**: 12-16px
- **Padding**: 6px 12px
- **Font Size**: 12px
- **Separator**: Comma between items

---

## Responsive Breakpoints

| Device | Width | Columns |
|--------|-------|---------|
| Mobile | < 640px | 1 |
| Tablet | 640px - 1024px | 2 |
| Desktop | > 1024px | 3-4 |

---

## Loading & Empty States

### Loading Skeleton
- Gray shimmer animation
- Matches card dimensions
- 200ms ease animation

### Empty State
- Icon: Magnifying glass or search icon
- Text: "Aucun professionnel trouvé" (No professionals found)
- Suggestion text in gray
- Center aligned

---

## Accessibility

- **Contrast Ratio**: WCAG AA compliant
- **Focus States**: Teal outline (2-3px)
- **Alt Text**: All images must have descriptive alt text
- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: For icon buttons and interactive elements

---

## Notes for Implementation

1. **Consistency**: All profile cards (freelance, enterprise, job) must follow this system
2. **Responsiveness**: Design adapts gracefully from mobile to desktop
3. **Hover Effects**: Cards have subtle lift effect, buttons have state feedback
4. **Colors**: Use CSS variables for theme colors (can be switched later)
5. **Fonts**: Use system fonts or specified variable (Urbanist/Inter if available)

