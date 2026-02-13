export const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes
    .flatMap((cls) => (typeof cls === 'string' ? cls.split(' ') : []))
    .filter(Boolean)
    .join(' ');
};

export default cn;
