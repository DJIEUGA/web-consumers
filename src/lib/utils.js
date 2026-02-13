/**
 * Utility helper: clsx + tailwind merge
 * Combines class names intelligently (useful with Tailwind)
 */

export const cn = (...classes) => {
  return classes
    .flatMap(cls => (typeof cls === 'string' ? cls.split(' ') : []))
    .filter(Boolean)
    .join(' ');
};

export default cn;
