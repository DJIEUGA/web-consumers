import React from 'react';
import { FiGrid } from 'react-icons/fi';
import RatingStars from './RatingStars';

export interface Enterprise {
  id: number | string;
  nom: string;
  type?: string;
  secteurs?: string[];
  photo?: string;
  image?: string;
  note?: number;
  isPro?: boolean;
}

interface Props {
  item: Enterprise;
  onVisit?: (id: number | string) => void;
}

const EnterpriseCard: React.FC<Props> = ({ item, onVisit }) => {
  return (
    <div className="entreprise-card">
      <div className="entreprise-image">
        {item.image && <img src={item.image} alt={item.nom} />}
        <span className="badge entreprise-badge">Entreprise</span>
        {item.isPro && <span className="badge pro-badge">PRO</span>}
      </div>

      <div className="entreprise-body">
        <div className="entreprise-photo-wrapper">
          <img src={item.photo} alt={item.nom} className="entreprise-photo" />
        </div>

        <h3 className="entreprise-name">{item.nom}</h3>
        <p className="entreprise-type">{item.type}</p>

        <div className="entreprise-secteurs">
          <FiGrid />
          <span>{item.secteurs?.[0]}{item.secteurs && item.secteurs.length > 1 ? ` +${item.secteurs.length - 1} secteurs` : ''}</span>
        </div>

        <div className="entreprise-rating">
          <RatingStars rating={Math.floor(item.note || 0)} />
        </div>

        <button className="visiter-btn" onClick={() => onVisit?.(item.id)}>VISITER</button>
      </div>
    </div>
  );
};

export default EnterpriseCard;
