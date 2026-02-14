export const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes
    .flatMap((cls) => (typeof cls === 'string' ? cls.split(' ') : []))
    .filter(Boolean)
    .join(' ');
};

// Utility to merge Tailwind CSS classes intelligently
export function clsx(...inputs: any[]): string {
  const classes = []
  
  for (const input of inputs) {
    if (!input) continue
    
    const type = typeof input
    
    if (type === 'string') {
      classes.push(input)
    } else if (Array.isArray(input)) {
      const joined = clsx(...input)
      if (joined) classes.push(joined)
    } else if (type === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key)
      }
    }
  }
  
  return classes.join(' ')
}

// Tailwind merge utility
export function twMerge(...inputs: string[]): string {
  return inputs.join(' ')
}

export default cn
