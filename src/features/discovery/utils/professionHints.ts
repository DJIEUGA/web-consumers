import professionSectorMap from '../data/profession-sector-map.json';

interface SectorKeywords {
  sector: string;
  keywords: string[];
}

const toAscii = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const normalizeSectorLabel = (value: string): string => {
  const normalized = toAscii(value);

  const sectorLabelMap: Record<string, string> = {
    sante: 'Santé',
    education: 'Éducation',
    'design & creation': 'Design & Création',
  };

  return sectorLabelMap[normalized] || value;
};

const normalizedMap = (professionSectorMap as SectorKeywords[]).map((entry) => ({
  sector: normalizeSectorLabel(entry.sector),
  keywords: entry.keywords.map((keyword) => toAscii(keyword)).filter(Boolean),
}));

const tokenize = (value: string): string[] =>
  toAscii(value)
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter(Boolean);

const hasWord = (normalizedQuery: string, keyword: string): boolean => {
  const padded = ` ${normalizedQuery} `;
  return padded.includes(` ${keyword} `);
};

export const inferSectorFromQuery = (query: string): string => {
  const normalizedQuery = toAscii(query);
  if (!normalizedQuery) return '';

  const tokenSet = new Set(tokenize(query));

  const match = normalizedMap.find((entry) =>
    entry.keywords.some((keyword) => {
      if (keyword.includes(' ')) {
        return normalizedQuery.includes(keyword);
      }
      return tokenSet.has(keyword) || hasWord(normalizedQuery, keyword);
    }),
  );

  return match ? match.sector : '';
};
