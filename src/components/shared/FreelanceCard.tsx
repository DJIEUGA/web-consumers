import React from 'react';
import { FiCheck, FiMapPin, FiDollarSign, FiClock } from 'react-icons/fi';
import RatingStars from './RatingStars';

export interface Freelance {
  id: number | string;
  nom: string;
  profession?: string;
  photo?: string;
  ville?: string;
  pays?: string;
  tarifMin?: number;
  devise?: string;
  disponible?: boolean;
  verifie?: boolean;
}

interface Props {
  item: Freelance;
  onContact?: (id: number | string) => void;
}

const FreelanceCard: React.FC<Props> = ({ item, onContact }) => {
  return (
    <div className="freelance-card">
      <div className="card-header">
        <span className="badge freelance-badge">Freelance</span>
        <div className="profile-photo-wrapper">
          <img src={item.photo} alt={item.nom} className="profile-photo" />
          {item.verifie && <span className="verified-badge"><FiCheck /></span>}
        </div>
      </div>

      <div className="card-body">
        <h3 className="card-name">{item.nom}</h3>
        <p className="card-profession">{item.profession}</p>

        <div className="card-info">
          <div className="info-item"><FiMapPin /> <span>{item.ville}, {item.pays}</span></div>
          <div className="info-item"><FiDollarSign /> <span>À partir de : {item.tarifMin?.toLocaleString()} {item.devise}</span></div>
          <div className="info-item"><FiClock /> <span className={item.disponible ? 'disponible' : 'indisponible'}>{item.disponible ? 'Disponible' : 'Indisponible'}</span></div>
        </div>

        <button className="contact-btn" onClick={() => onContact?.(item.id)}>Contacter</button>
      </div>
    </div>
  );
};

export default FreelanceCard;
