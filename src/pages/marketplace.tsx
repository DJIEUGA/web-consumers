import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { COLORS } from "../styles/colors";
import "./marketplace.css";

import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import FiltersBar from "../components/shared/FiltersBar";
import FreelanceCard from "../components/shared/FreelanceCard";
import EnterpriseCard from "../components/shared/EnterpriseCard";
import JobCard from "../components/shared/JobCard";
import SidebarMenu from "../components/shared/SidebarMenu";
import { FiAward, FiBriefcase, FiStar, FiUser } from "react-icons/fi";

function Marketplace() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);

  // États des filtres
  const [filters, setFilters] = useState({
    search: searchParams.get("q") || searchParams.get("secteur") || "",
    secteur: "",
    pays: "",
    ville: "",
    categorie: "",
  });

  // Données mockées - Freelances
  const freelances = [
    {
      id: 1,
      nom: "Amadou Diallo",
      profession: "Développeur Full-Stack",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amadou",
      ville: "Dakar",
      pays: "Sénégal",
      tarifMin: 15000,
      devise: "FCFA/H",
      disponible: true,
      verifie: true,
    },
    {
      id: 2,
      nom: "Fatou Sow",
      profession: "Designer UI/UX",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou",
      ville: "Abidjan",
      pays: "Côte d'Ivoire",
      tarifMin: 12000,
      devise: "FCFA/H",
      disponible: true,
      verifie: true,
    },
    {
      id: 3,
      nom: "Kofi Mensah",
      profession: "Électricien Bâtiment",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kofi",
      ville: "Accra",
      pays: "Ghana",
      tarifMin: 8000,
      devise: "FCFA/H",
      disponible: false,
      verifie: true,
    },
    {
      id: 4,
      nom: "Aïcha Traoré",
      profession: "Comptable",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aicha",
      ville: "Bamako",
      pays: "Mali",
      tarifMin: 10000,
      devise: "FCFA/H",
      disponible: true,
      verifie: false,
    },
    {
      id: 5,
      nom: "Omar Sy",
      profession: "Plombier Professionnel",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Omar",
      ville: "Dakar",
      pays: "Sénégal",
      tarifMin: 7500,
      devise: "FCFA/H",
      disponible: true,
      verifie: true,
    },
    {
      id: 6,
      nom: "Marie Kouassi",
      profession: "Graphiste",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marie",
      ville: "Douala",
      pays: "Cameroun",
      tarifMin: 11000,
      devise: "FCFA/H",
      disponible: true,
      verifie: true,
    },
    {
      id: 7,
      nom: "Ibrahim Keita",
      profession: "Menuisier",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ibrahim",
      ville: "Conakry",
      pays: "Guinée",
      tarifMin: 6000,
      devise: "FCFA/H",
      disponible: true,
      verifie: false,
    },
    {
      id: 8,
      nom: "Aminata Bah",
      profession: "Community Manager",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aminata",
      ville: "Dakar",
      pays: "Sénégal",
      tarifMin: 9000,
      devise: "FCFA/H",
      disponible: true,
      verifie: true,
    },
  ];

  // Données mockées - Entreprises
  const entreprises = [
    {
      id: 1,
      nom: "Tech Solutions Africa",
      type: "Entreprise",
      secteurs: ["Informatique", "Conseil", "Formation"],
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=TechSol",
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
      note: 4.5,
      isPro: true,
    },
    {
      id: 2,
      nom: "BTP Construct",
      type: "Entreprise",
      secteurs: ["Bâtiment", "Travaux", "Architecture"],
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=BTP",
      image:
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400",
      note: 4.0,
      isPro: true,
    },
    {
      id: 3,
      nom: "Santé Plus Clinic",
      type: "Entreprise",
      secteurs: ["Santé", "Bien-être", "Pharma"],
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sante",
      image:
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400",
      note: 4.8,
      isPro: true,
    },
    {
      id: 4,
      nom: "Creative Studio",
      type: "Entreprise",
      secteurs: ["Design", "Marketing", "Communication"],
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Creative",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400",
      note: 3.5,
      isPro: false,
    },
    {
      id: 5,
      nom: "Transport Express",
      type: "Entreprise",
      secteurs: ["Transport", "Logistique"],
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Transport",
      image:
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400",
      note: 4.2,
      isPro: true,
    },
    {
      id: 6,
      nom: "Agro Services",
      type: "Entreprise",
      secteurs: ["Agriculture", "Élevage"],
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Agro",
      image:
        "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400",
      note: 4.0,
      isPro: false,
    },
  ];

  // Données mockées - Job Experience
  const jobExperiences = [
    {
      id: 1,
      nom: "Jean-Pierre Kamga",
      poste: "Administrateur Réseau",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=JeanPierre",
      entreprise: "CNPS",
      ville: "Douala",
      pays: "Cameroun",
      salaire: 800,
      devise: "$/mois",
      duree: "3 mois",
      note: 4,
    },
    {
      id: 2,
      nom: "Mariama Diop",
      poste: "Assistante RH",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariama",
      entreprise: "Orange Sénégal",
      ville: "Dakar",
      pays: "Sénégal",
      salaire: 600,
      devise: "$/mois",
      duree: "6 mois",
      note: 5,
    },
    {
      id: 3,
      nom: "Kwame Asante",
      poste: "Développeur Junior",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kwame",
      entreprise: "MTN Ghana",
      ville: "Accra",
      pays: "Ghana",
      salaire: 950,
      devise: "$/mois",
      duree: "12 mois",
      note: 4,
    },
  ];

  // Listes pour les filtres
  const secteurs = [
    "Tous les secteurs",
    "Bâtiment & Travaux",
    "Électricité & Plomberie",
    "Informatique & Tech",
    "Design & Création",
    "Santé & Bien-être",
    "Éducation & Formation",
    "Commerce & Vente",
    "Transport & Logistique",
  ];

  const paysListe = [
    "Tous les pays",
    "Sénégal",
    "Côte d'Ivoire",
    "Mali",
    "Cameroun",
    "Ghana",
    "Guinée",
    "Burkina Faso",
    "Nigeria",
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Filtres appliqués:", filters);
  };

  const toggleMenu = () => setMenuOpen((s) => !s);
  const closeMenu = () => setMenuOpen(false);

  // Rendu des étoiles
  const renderStars = (note, filled = true) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar
          key={i}
          className={`star ${i <= note ? "filled" : ""}`}
          style={{
            fill: i <= note ? (filled ? "#FFD700" : COLORS.primary) : "none",
            color: i <= note ? (filled ? "#FFD700" : COLORS.primary) : "#ddd",
          }}
        />,
      );
    }
    return stars;
  };

  return (
    <div className="marketplace-container">
      <Header onOpenMenu={toggleMenu} />
      <SidebarMenu open={menuOpen} onClose={closeMenu} />
      {menuOpen && <div className="sidebar-overlay" onClick={closeMenu} />}

      {/* SECTION HERO */}
      <section className="hero-section">
        <h1 className="hero-title">
          Trouvez des professionnels
          <br />
          <span className="highlight">qualifiés</span> adaptés à votre projet
        </h1>
        <p className="hero-subtitle">
          Découvrez et contactez les meilleurs freelances et entreprises de
          services
        </p>
      </section>

      {/* BARRE DE FILTRES */}
      <section className="filters-section">
        <FiltersBar
          filters={filters}
          secteurs={secteurs}
          pays={paysListe}
          onChange={(name, value) => setFilters({ ...filters, [name]: value })}
          onSubmit={() => handleSearch}
        />

        <p className="results-count">
          <strong>{freelances.length + entreprises.length}</strong> résultats
          trouvés
        </p>
      </section>

      {/* SECTION FREELANCE */}
      <section className="freelance-section">
        <div className="section-header">
          <h2 className="section-title">
            <FiUser className="section-icon" />
            Freelance
          </h2>
          <span className="section-count">
            {freelances.length * 531} Profils
          </span>
        </div>

        <div className="freelance-grid">
          {freelances.map((f) => (
            <FreelanceCard
              key={f.id}
              item={f}
              onContact={(id) => navigate(`/profil-freelance/${id}`)}
            />
          ))}
        </div>

        <button
          className="voir-plus-btn"
          style={{ borderColor: COLORS.primary, color: COLORS.primary }}
        >
          Voir plus de freelances
        </button>
      </section>

      {/* SECTION ENTREPRISE */}
      <section className="entreprise-section">
        <div className="section-header">
          <h2 className="section-title">
            <FiBriefcase className="section-icon" />
            Entreprise
          </h2>
          <span className="section-count">
            {entreprises.length * 708} Profils
          </span>
        </div>

        <div className="entreprise-grid">
          {entreprises.map((e) => (
            <EnterpriseCard
              key={e.id}
              item={e}
              onVisit={(id) => navigate(`/profil/entreprise/${id}`)}
            />
          ))}
        </div>

        <button
          className="voir-plus-btn"
          style={{ borderColor: COLORS.secondary, color: COLORS.secondary }}
        >
          Voir plus d'entreprises
        </button>
      </section>

      {/* SECTION JOB EXPERIENCE */}

      <section className="job-experience-section">
        <div className="section-header light">
          <h2 className="section-title">
            <FiAward className="section-icon" />
            Job expérience
          </h2>
          <span className="section-count">
            {jobExperiences.length * 17} Profils
          </span>
        </div>

        <div className="job-experience-grid">
          {jobExperiences.map((job) => (
            <JobCard
              key={job.id}
              item={job}
              onView={(id) => navigate(`/profil/experience/${id}`)}
            />
          ))}
        </div>

        <button
          className="voir-plus-btn light"
          style={{ borderColor: "white", color: "white" }}
          onClick={() => navigate("/job-experience")}
        >
          Voir plus de profils
        </button>
      </section>

      <Footer />
    </div>
  );
}

export default Marketplace;
