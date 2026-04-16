import React from 'react';
import { FiBriefcase, FiMapPin, FiDollarSign, FiCalendar } from 'react-icons/fi';
import RatingStars from './RatingStars';

export interface JobExperience {
  id: number | string;
  nom: string;
  poste?: string;
  photo?: string;
  entreprise?: string;
  ville?: string;
  pays?: string;
  salaire?: number;
  devise?: string;
  duree?: string;
  note?: number;
}

interface Props {
  item: JobExperience;
  onView?: (id: number | string) => void;
}

const JobCard: React.FC<Props> = ({ item, onView }) => {
  return (
    <div className="job-card">
      <div className="job-card-left">
        {item.photo && <img src={item.photo} alt={item.nom} className="job-photo" />}
        <h3 className="job-name">{item.nom}</h3>
        <p className="job-poste">{item.poste}</p>
        <div className="job-stars"><RatingStars rating={item.note || 0} /></div>
      </div>

      <div className="job-card-right">
        <span className="badge experience-badge">Expérience pro</span>

        <div className="job-details">
          <div className="job-detail-item"><FiBriefcase /> <span>{item.poste}</span></div>
          <div className="job-detail-item"><FiMapPin /> <span>{item.ville}, {item.pays} / {item.entreprise}</span></div>
          <div className="job-detail-item"><FiDollarSign /> <span>Salaire : {item.salaire}{item.devise}</span></div>
          <div className="job-detail-item"><FiCalendar /> <span>{item.duree}</span></div>
        </div>

        <button className="voir-plus-job-btn" onClick={() => onView?.(item.id)}>VOIR LE +</button>
      </div>
    </div>
  );
};

export default JobCard;
