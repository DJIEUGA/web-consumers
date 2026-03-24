import React from 'react';
import type { MarketplaceSearchMetadata } from '../api/marketplaceTypes';

type SearchInsightsProps = {
  metadata?: MarketplaceSearchMetadata;
};

const SearchInsights: React.FC<SearchInsightsProps> = ({ metadata }) => {
  if (!metadata) return null;

  const tokens = metadata.appliedQueryTokens || [];
  const resolvedSectors = metadata.resolvedSectors || [];
  const resolvedSpecializations = metadata.resolvedSpecializations || [];
  const minimumTokenMatches = metadata.minimumTokenMatches;

  const hasInsights =
    tokens.length > 0 ||
    resolvedSectors.length > 0 ||
    resolvedSpecializations.length > 0 ||
    minimumTokenMatches !== undefined;

  if (!hasInsights) return null;

  return (
    <div className="search-insights" aria-live="polite">
      {resolvedSectors.length > 0 && (
        <p>Interprete comme secteur: {resolvedSectors.join(', ')}</p>
      )}

      {resolvedSpecializations.length > 0 && (
        <p>Specialisations resolues: {resolvedSpecializations.join(', ')}</p>
      )}

      {tokens.length > 0 && <p>Mots-clés appliques: {tokens.join(', ')}</p>}

      {minimumTokenMatches !== undefined && (
        <p>Matching d'au moins {minimumTokenMatches} mot(s)-cle(s).</p>
      )}
    </div>
  );
};

export default SearchInsights;
