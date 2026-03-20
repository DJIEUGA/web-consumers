const normalizeText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export interface SectorOption {
  slug: string;
  label: string;
  aliases?: string[];
}

export const SECTOR_OPTIONS: SectorOption[] = [
  { slug: 'batiment', label: 'Batiment & Travaux', aliases: ['BTP'] },
  { slug: 'electricite', label: 'Electricite' },
  { slug: 'informatique', label: 'Informatique & Tech', aliases: ['developpement', 'developpeur'] },
  { slug: 'design', label: 'Design & Creation' },
  { slug: 'sante', label: 'Sante', aliases: ['bien-etre', 'bien etre'] },
  { slug: 'education', label: 'Education & Formation' },
  { slug: 'commerce', label: 'Commerce & Vente' },
  { slug: 'transport', label: 'Transport & Logistique' },
  { slug: 'agriculture', label: 'Agriculture' },
  { slug: 'artisanat', label: 'Artisanat' },
  { slug: 'juridique', label: 'Juridique & Administratif' },
  { slug: 'marketing', label: 'Marketing & Communication' },
  { slug: 'finance', label: 'Finance & Comptabilite' },
  { slug: 'evenementiel', label: 'Evenementiel' },
  { slug: 'restauration', label: 'Restauration' },
  { slug: 'mecanique', label: 'Mecanique & Automobile' },
  { slug: 'beaute', label: 'Beaute & Bien-etre' },
  { slug: 'sport', label: 'Sport & Fitness' },
  { slug: 'plomberie', label: 'Plomberie & Chauffage' },
  { slug: 'intelligence-artificielle', label: 'Intelligence Artificielle', aliases: ['ia', 'machine learning', 'data science'] },
  { slug: 'sons-musique', label: 'Sons & Musique', aliases: ['musique', 'son'] },
  { slug: 'video', label: 'Video & Audiovisuel', aliases: ['audiovisuel'] },
];

const sectorBySlug = new Map(SECTOR_OPTIONS.map((sector) => [sector.slug, sector]));

const sectorByNormalizedLabel = new Map(
  SECTOR_OPTIONS.flatMap((sector) => {
    const entries: Array<[string, SectorOption]> = [[normalizeText(sector.label), sector]];
    if (sector.aliases?.length) {
      sector.aliases.forEach((alias) => {
        entries.push([normalizeText(alias), sector]);
      });
    }
    return entries;
  }),
);

export const resolveSectorSlug = (value: string | null | undefined): string => {
  if (!value) return '';

  const trimmed = value.trim();
  if (!trimmed) return '';

  const normalized = normalizeText(trimmed);

  const bySlug = sectorBySlug.get(trimmed);
  if (bySlug) return bySlug.slug;

  for (const [slug, sector] of sectorBySlug) {
    if (normalizeText(slug) === normalized) return slug;
    if (normalizeText(sector.label) === normalized) return slug;
    if (sector.aliases?.some((alias) => normalizeText(alias) === normalized)) return slug;
  }

  return sectorByNormalizedLabel.get(normalized)?.slug || trimmed;
};

export const resolveSectorLabel = (slug: string | null | undefined): string => {
  const resolvedSlug = resolveSectorSlug(slug);
  return sectorBySlug.get(resolvedSlug)?.label || '';
};

export const getSectorKeywords = (slug: string | null | undefined): string[] => {
  const resolvedSlug = resolveSectorSlug(slug);
  const sector = sectorBySlug.get(resolvedSlug);
  if (!sector) return [];

  return [resolvedSlug, sector.label, ...(sector.aliases || [])]
    .map((entry) => normalizeText(entry))
    .filter(Boolean);
};

export const normalizeSectorText = normalizeText;
