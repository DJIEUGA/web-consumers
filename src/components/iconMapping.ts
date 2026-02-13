/**
 * Icon mappings for Jobty
 * Maps common icon names to Iconbuddy icon identifiers
 * 
 * Usage in components:
 * import { ICON_NAMES, getIconProps } from './iconMapping';
 * <Icon {...getIconProps('search')} />
 */

export type IconDefinition = {
  name: string;
  collection: string;
};

export const ICON_NAMES = {
  // Navigation
  home: { name: 'home', collection: 'lucide' },
  menu: { name: 'menu', collection: 'lucide' },
  x: { name: 'x', collection: 'lucide' },
  search: { name: 'search', collection: 'lucide' },

  // Common actions
  heart: { name: 'heart', collection: 'lucide' },
  share: { name: 'share-2', collection: 'lucide' },
  download: { name: 'download', collection: 'lucide' },
  upload: { name: 'upload', collection: 'lucide' },
  edit: { name: 'edit', collection: 'lucide' },
  delete: { name: 'trash-2', collection: 'lucide' },
  copy: { name: 'copy', collection: 'lucide' },

  // Location & Maps
  mapPin: { name: 'map-pin', collection: 'lucide' },
  navigation: { name: 'navigation', collection: 'lucide' },
  map: { name: 'map', collection: 'lucide' },

  // Communication
  phone: { name: 'phone', collection: 'lucide' },
  mail: { name: 'mail', collection: 'lucide' },
  messageCircle: { name: 'message-circle', collection: 'lucide' },
  bell: { name: 'bell', collection: 'lucide' },

  // User & Profile
  user: { name: 'user', collection: 'lucide' },
  users: { name: 'users', collection: 'lucide' },
  userCheck: { name: 'user-check', collection: 'lucide' },

  // Business
  briefcase: { name: 'briefcase', collection: 'lucide' },
  shoppingCart: { name: 'shopping-cart', collection: 'lucide' },
  zap: { name: 'zap', collection: 'lucide' },
  star: { name: 'star', collection: 'lucide' },
  trendingUp: { name: 'trending-up', collection: 'lucide' },

  // Time & Calendar
  clock: { name: 'clock', collection: 'lucide' },
  calendar: { name: 'calendar', collection: 'lucide' },

  // Social
  facebook: { name: 'facebook', collection: 'lucide' },
  instagram: { name: 'instagram', collection: 'lucide' },
  twitter: { name: 'twitter', collection: 'lucide' },
  linkedin: { name: 'linkedin', collection: 'lucide' },

  // UI Controls
  chevronLeft: { name: 'chevron-left', collection: 'lucide' },
  chevronRight: { name: 'chevron-right', collection: 'lucide' },
  chevronDown: { name: 'chevron-down', collection: 'lucide' },
  chevronUp: { name: 'chevron-up', collection: 'lucide' },
  arrowRight: { name: 'arrow-right', collection: 'lucide' },
  arrowLeft: { name: 'arrow-left', collection: 'lucide' },

  // Status
  checkCircle: { name: 'check-circle', collection: 'lucide' },
  alertCircle: { name: 'alert-circle', collection: 'lucide' },
  info: { name: 'info', collection: 'lucide' },

  // Utilities
  filter: { name: 'filter', collection: 'lucide' },
  settings: { name: 'settings', collection: 'lucide' },
  help: { name: 'help-circle', collection: 'lucide' },
  externalLink: { name: 'external-link', collection: 'lucide' },
} as const satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof ICON_NAMES;

export type IconProps = IconDefinition & {
  size: number;
  color: string;
};

/**
 * Get icon props by name
 */
export const getIconProps = (
  iconName: IconName,
  size: number = 24,
  color: string = 'currentColor'
): IconProps => {
  const icon = ICON_NAMES[iconName];

  if (!icon) {
    console.warn(`Icon "${iconName}" not found in ICON_NAMES mapping`);
    return { name: 'help-circle', collection: 'lucide', size, color };
  }

  return {
    ...icon,
    size,
    color,
  };
};

/**
 * Common icon sizes for consistent usage
 */
export const ICON_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  '2xl': 48,
} as const;

export type IconSizeKey = keyof typeof ICON_SIZES;
