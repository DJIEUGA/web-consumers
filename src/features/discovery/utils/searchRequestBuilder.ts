import { inferSectorFromQuery } from './professionHints';

export type SmartQueryResult = {
  query: string;
  inferredCity: string;
  inferredSector: string;
};

export const extractSmartQuery = (rawQuery: string): SmartQueryResult => {
  const trimmed = rawQuery.trim();
  if (!trimmed) {
    return { query: '', inferredCity: '', inferredSector: '' };
  }

  const separators = [' à ', ' a '];
  for (const separator of separators) {
    const idx = trimmed.toLowerCase().lastIndexOf(separator);
    if (idx > 0) {
      const query = trimmed.slice(0, idx).trim();
      const inferredCity = trimmed.slice(idx + separator.length).trim();
      if (query && inferredCity) {
        return { query, inferredCity, inferredSector: inferSectorFromQuery(query) };
      }
    }
  }

  return { query: trimmed, inferredCity: '', inferredSector: inferSectorFromQuery(trimmed) };
};

export const resolveSmartSearchInput = (input: {
  search: string;
  city: string;
  sector: string;
  resolveSector?: (value: string) => string;
}) => {
  const smart = extractSmartQuery(input.search);
  const resolvedCity = input.city.trim() || smart.inferredCity;
  const inferredSector = input.resolveSector
    ? input.resolveSector(smart.inferredSector)
    : smart.inferredSector;
  const resolvedSector = input.sector.trim() || inferredSector;

  return {
    query: smart.query,
    resolvedCity,
    resolvedSector,
  };
};
