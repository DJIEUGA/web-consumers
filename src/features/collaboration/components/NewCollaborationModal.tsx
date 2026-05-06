import React, { useState, useEffect } from "react";
import { 
  FiSearch, 
  FiX, 
  FiUser, 
  FiPlus, 
  FiCheck, 
  FiLoader,
  FiMapPin,
  FiBriefcase
} from "react-icons/fi";
import { toast } from "sonner";
import "./NewCollaborationModal.css";

interface Professional {
  id: string;
  nom: string;
  prenom: string;
  handle?: string;
  role: string;
  photo: string;
  location?: string;
  specialization?: string;
}

interface NewCollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (professional: Professional) => void;
}

const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: "pro1",
    nom: "Koné",
    prenom: "Aminata",
    handle: "@aminata_dev",
    role: "Développeuse Full Stack",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aminata",
    location: "Abidjan, Côte d'Ivoire",
    specialization: "React / Node.js"
  },
  {
    id: "pro2",
    nom: "Sow",
    prenom: "Mamadou",
    handle: "@mamadou_design",
    role: "UI/UX Designer",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mamadou",
    location: "Dakar, Sénégal",
    specialization: "Product Design"
  },
  {
    id: "pro3",
    nom: "Diallo",
    prenom: "Fatou",
    handle: "@fatou_marketing",
    role: "Social Media Manager",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou",
    location: "Conakry, Guinée",
    specialization: "Digital Strategy"
  },
  {
    id: "pro4",
    nom: "Traoré",
    prenom: "Bakary",
    handle: "@bakary_data",
    role: "Data Analyst",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bakary",
    location: "Bamako, Mali",
    specialization: "Python / SQL"
  },
  {
    id: "ent1",
    nom: "Tech",
    prenom: "Global",
    handle: "@global_tech",
    role: "Entreprise de Services Numériques",
    photo: "https://api.dicebear.com/7.x/initials/svg?seed=GT",
    location: "Abidjan, Côte d'Ivoire",
    specialization: "Cloud & Devops"
  }
];

export const NewCollaborationModal: React.FC<NewCollaborationModalProps> = ({
  isOpen,
  onClose,
  onCreated
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Professional[]>([]);
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        const filtered = MOCK_PROFESSIONALS.filter(pro => 
          pro.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pro.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (pro.handle && pro.handle.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setResults(filtered);
        setIsSearching(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [searchTerm]);

  const handleCreate = () => {
    if (!selectedPro) return;
    
    setIsCreating(true);
    // Simulation d'API
    setTimeout(() => {
      setIsCreating(false);
      toast.success(`Invitation envoyée à ${selectedPro.prenom} ${selectedPro.nom}`);
      onCreated?.(selectedPro);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="new-collab-overlay" onClick={onClose}>
      <div className="new-collab-modal" onClick={e => e.stopPropagation()}>
        <div className="new-collab-header">
          <h2>Nouvelle collaboration</h2>
          <button className="new-collab-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="new-collab-body">
          <p className="new-collab-description">
            Recherchez un professionnel par son nom ou son identifiant (@handle) pour démarrer un nouvel espace de collaboration.
          </p>

          <div className="new-collab-search-container">
            <FiSearch className="new-collab-search-icon" />
            <input
              type="text"
              placeholder="Rechercher par nom ou @handle..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="new-collab-input"
              autoFocus
            />
            {isSearching && <FiLoader className="new-collab-loader-spinner" />}
          </div>

          <div className="new-collab-results">
            {searchTerm.length < 2 ? (
              <div className="new-collab-empty">
                <FiUser size={32} />
                <p>Saisissez au moins 2 caractères pour rechercher</p>
              </div>
            ) : results.length > 0 ? (
              results.map(pro => (
                <div 
                  key={pro.id} 
                  className={`new-collab-pro-item ${selectedPro?.id === pro.id ? "selected" : ""}`}
                  onClick={() => setSelectedPro(pro)}
                >
                  <img src={pro.photo} alt={pro.nom} className="new-collab-pro-photo" />
                  <div className="new-collab-pro-info">
                    <div className="new-collab-pro-name-row">
                      <strong>{pro.prenom} {pro.nom}</strong>
                      {pro.handle && <span className="new-collab-pro-handle">{pro.handle}</span>}
                    </div>
                    <div className="new-collab-pro-meta">
                      <span><FiBriefcase size={12} /> {pro.role}</span>
                      {pro.location && <span><FiMapPin size={12} /> {pro.location}</span>}
                    </div>
                  </div>
                  {selectedPro?.id === pro.id && (
                    <div className="new-collab-check-icon">
                      <FiCheck />
                    </div>
                  )}
                </div>
              ))
            ) : !isSearching && (
              <div className="new-collab-empty">
                <FiX size={32} />
                <p>Aucun professionnel trouvé pour "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>

        <div className="new-collab-footer">
          <button className="new-collab-cancel-btn" onClick={onClose}>
            Annuler
          </button>
          <button 
            className="new-collab-create-btn" 
            disabled={!selectedPro || isCreating}
            onClick={handleCreate}
          >
            {isCreating ? (
              <><FiLoader className="new-collab-loader-spinner" /> Création...</>
            ) : (
              <><FiPlus /> Créer un nouvel espace de collaboration</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
