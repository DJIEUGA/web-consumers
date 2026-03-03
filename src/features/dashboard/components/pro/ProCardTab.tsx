import React, { useEffect, useMemo, useState } from "react";
import {
  FiCamera,
  FiSave,
  FiCheckCircle,
  FiMapPin,
  FiDollarSign,
  FiMessageCircle,
  FiZap,
  FiStar,
} from "react-icons/fi";
import { FaHandshake } from "react-icons/fa";
import { useDashboardProfile } from "../../hooks/useDashboardProfile";
import { useUpdateProProfileMutation } from "@/features/profile/hooks/useProfileMutations";

const ProCardTab: React.FC = () => {
  const { profile, isLoading: isProfileLoading } = useDashboardProfile();
  const updateProProfileMutation = useUpdateProProfileMutation();
  const [cardSaveStatusMessage, setCardSaveStatusMessage] = useState("");

  const mapActionButtonToFormType = (
    apiType: unknown
  ): "contacter" | "collaborer" => {
    if (apiType === 0 || apiType === "0") return "contacter";
    if (apiType === 1 || apiType === "1") return "collaborer";
    const normalized = String(apiType ?? "").trim().toUpperCase();
    return normalized === "CONTACT" ? "contacter" : "collaborer";
  };

  const mapFormTypeToActionButton = (
    formType: string
  ): "CONTACT" | "COLLABORATE" => {
    return formType === "contacter" ? "CONTACT" : "COLLABORATE";
  };

  const isMissingValue = (value: unknown) =>
    value === null || value === undefined || String(value).trim() === "";

  const missingCardInfo = useMemo(
    () => ({
      photo: isMissingValue(profile.avatarUrl),
      prenom: isMissingValue(profile.firstName),
      nom: isMissingValue(profile.lastName),
      sector: isMissingValue(profile.sector),
      specialization: isMissingValue(profile.specialization),
      ville: isMissingValue(profile.city),
      pays: isMissingValue(profile.country),
      tarifHoraire:
        profile.hourlyRate === null || profile.hourlyRate === undefined,
    }),
    [profile]
  );

  const initialCarteForm = useMemo(
    () => ({
      photo: profile.avatarUrl,
      nom: profile.lastName,
      prenom: profile.firstName,
      sector: profile.sector,
      specialization: profile.specialization,
      ville: profile.city,
      pays: profile.country,
      tarifHoraire: profile.hourlyRate ?? "",
      tags: Array.isArray(profile.skills) ? profile.skills : [],
      disponible: profile.available,
      typeBouton: mapActionButtonToFormType(profile.actionButtonType),
    }),
    [profile]
  );

  const [carteForm, setCarteForm] = useState(initialCarteForm);

  useEffect(() => {
    if (!isProfileLoading && profile.userId) {
      setCarteForm({
        photo: profile.avatarUrl,
        nom: profile.lastName,
        prenom: profile.firstName,
        sector: profile.sector,
        specialization: profile.specialization,
        ville: profile.city,
        pays: profile.country,
        tarifHoraire: profile.hourlyRate ?? "",
        tags: Array.isArray(profile.skills) ? profile.skills : [],
        disponible: profile.available,
        typeBouton: mapActionButtonToFormType(profile.actionButtonType),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.userId]);

  useEffect(() => {
    setCarteForm((prev) => ({
      ...prev,
      disponible: profile.available,
      typeBouton: mapActionButtonToFormType(profile.actionButtonType),
    }));
  }, [profile.available, profile.actionButtonType]);

  const freelance = {
    id: profile.userId || "1",
    ...carteForm,
    note: profile.averageRating || 0,
    nbAvis: profile.reviewCount || 0,
    verified: profile.verified,
    plan: profile.premium ? "premium" : "gratuit",
  };

  const handleCarteFormChange = (field: string, value: any) => {
    setCarteForm({ ...carteForm, [field]: value });
  };

  const handleSaveCarte = () => {
    setCardSaveStatusMessage("");
    updateProProfileMutation.mutate(
      {
        actionButtonType: mapFormTypeToActionButton(carteForm.typeBouton),
        isAvailable: carteForm.disponible,
        available: carteForm.disponible,
        avatarUrl: carteForm.photo,
        sector: carteForm.sector,
        specialization: carteForm.specialization,
        city: carteForm.ville,
        country: carteForm.pays,
        skills: carteForm.tags,
        hourlyRate:
          carteForm.tarifHoraire === "" || carteForm.tarifHoraire === null
            ? undefined
            : Number(carteForm.tarifHoraire),
      },
      {
        onSuccess: (data: any) => {
          if (data?.success === false) {
            setCardSaveStatusMessage(
              "Card updates could not be saved. Please try again."
            );
            return;
          }
          setCardSaveStatusMessage("Card updates saved successfully.");
        },
        onError: () => {
          setCardSaveStatusMessage(
            "Card updates could not be saved. Please try again."
          );
        },
      }
    );
  };

  const renderStars = (note: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar
          key={i}
          style={{
            fill: i <= Math.floor(note) ? "#FFD700" : "none",
            color: i <= Math.floor(note) ? "#FFD700" : "#ddd",
          }}
        />
      );
    }
    return stars;
  };

  return (
    <div className="dash-carte-section">
      <div className="dash-section-header">
        <div>
          <h2>Configurer ma carte professionnelle</h2>
          <p className="dash-section-subtitle">
            Complétez les informations pour votre profil public
          </p>
        </div>
      </div>

      <div className="dash-form-container">
        <form className="dash-carte-form">
          {/* Photo de profil */}
          <div className="dash-form-section">
            <h3>Photo de profil</h3>
            <div className="dash-photo-upload">
              <div className="dash-photo-preview">
                <img src={carteForm.photo} alt="Aperçu" />
              </div>
              <button type="button" className="dash-btn-secondary" disabled>
                <FiCamera /> Aperçu avatar
              </button>
            </div>
            <div className="dash-form-group" style={{ marginTop: "12px" }}>
              <label>URL de l'avatar</label>
              <input
                type="url"
                value={carteForm.photo}
                onChange={(e) =>
                  handleCarteFormChange("photo", e.target.value)
                }
                placeholder="https://..."
              />
              {missingCardInfo.photo && (
                <p className="dash-form-hint">
                  Avatar URL could not be loaded from API.
                </p>
              )}
            </div>
          </div>

          {/* Informations de base (lecture seule) */}
          <div className="dash-form-section">
            <h3>Informations de base</h3>
            <div className="dash-form-grid">
              <div className="dash-form-group">
                <label>Prénom *</label>
                <input type="text" value={carteForm.prenom} readOnly disabled />
                {missingCardInfo.prenom && (
                  <p className="dash-form-hint">
                    First name could not be loaded from API.
                  </p>
                )}
              </div>
              <div className="dash-form-group">
                <label>Nom *</label>
                <input type="text" value={carteForm.nom} readOnly disabled />
                {missingCardInfo.nom && (
                  <p className="dash-form-hint">
                    Last name could not be loaded from API.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Spécialisation (lecture seule) */}
          <div className="dash-form-section">
            <h3>Spécialisation (lecture seule)</h3>
            <div className="dash-form-group">
              <label>Secteur d'activité (pour référencement uniquement)</label>
              <select value={carteForm.sector} disabled>
                <option>Informatique</option>
                <option>Design</option>
                <option>Marketing</option>
                <option>Rédaction</option>
                <option>Photographie</option>
              </select>
              {missingCardInfo.sector && (
                <p className="dash-form-hint">
                  Sector could not be loaded from API.
                </p>
              )}
            </div>
            <div className="dash-form-group">
              <label>Spécialité (affichée sur la carte) *</label>
              <input
                type="text"
                value={carteForm.specialization}
                readOnly
                disabled
                placeholder="Ex: Développeur Full Stack"
              />
              {missingCardInfo.specialization && (
                <p className="dash-form-hint">
                  Specialization could not be loaded from API.
                </p>
              )}
            </div>
          </div>

          {/* Localisation (lecture seule) */}
          <div className="dash-form-section">
            <h3>Localisation (lecture seule)</h3>
            <div className="dash-form-grid">
              <div className="dash-form-group">
                <label>Ville *</label>
                <input type="text" value={carteForm.ville} readOnly disabled />
                {missingCardInfo.ville && (
                  <p className="dash-form-hint">
                    City could not be loaded from API.
                  </p>
                )}
              </div>
              <div className="dash-form-group">
                <label>Pays *</label>
                <input type="text" value={carteForm.pays} readOnly disabled />
                {missingCardInfo.pays && (
                  <p className="dash-form-hint">
                    Country could not be loaded from API.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tarif (lecture seule) */}
          <div className="dash-form-section">
            <h3>Tarif (lecture seule)</h3>
            <div className="dash-form-group">
              <label>Tarif horaire (FCFA) *</label>
              <input
                type="number"
                value={carteForm.tarifHoraire}
                readOnly
                disabled
              />
              {missingCardInfo.tarifHoraire && (
                <p className="dash-form-hint">
                  Hourly rate could not be loaded from API.
                </p>
              )}
            </div>
          </div>

          {/* Tags de référencement (lecture seule) */}
          <div className="dash-form-section">
            <h3>Tags de référencement (lecture seule)</h3>
            <p className="dash-form-hint">
              Ces tags ne sont pas visibles sur votre carte mais aident au
              classement
            </p>
            <div className="dash-tags-input">
              <div className="dash-tags-list">
                {carteForm.tags.map((tag, index) => (
                  <span key={index} className="dash-tag-item">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Disponibilité */}
          <div className="dash-form-section">
            <h3>Disponibilité</h3>
            <label className="dash-toggle">
              <input
                type="checkbox"
                checked={carteForm.disponible}
                onChange={(e) =>
                  handleCarteFormChange("disponible", e.target.checked)
                }
              />
              <span className="dash-toggle-slider"></span>
              <span className="dash-toggle-label">
                {carteForm.disponible ? "Disponible" : "Indisponible"}
              </span>
            </label>
          </div>

          {/* Type de bouton */}
          <div className="dash-form-section">
            <h3>Bouton d'action sur votre carte</h3>
            <p className="dash-form-hint">
              Choisissez le bouton qui apparaîtra sur votre carte publique
            </p>
            <div className="dash-radio-group">
              <label className="dash-radio">
                <input
                  type="radio"
                  name="typeBouton"
                  value="contacter"
                  checked={carteForm.typeBouton === "contacter"}
                  onChange={(e) =>
                    handleCarteFormChange("typeBouton", e.target.value)
                  }
                />
                <span>Bouton "Contacter"</span>
              </label>
              <label className="dash-radio">
                <input
                  type="radio"
                  name="typeBouton"
                  value="collaborer"
                  checked={carteForm.typeBouton === "collaborer"}
                  onChange={(e) =>
                    handleCarteFormChange("typeBouton", e.target.value)
                  }
                />
                <span>Bouton "Collaborer"</span>
              </label>
            </div>
          </div>

          <div className="dash-form-actions">
            <button type="button" className="dash-btn-secondary">
              Annuler
            </button>
            <button
              type="button"
              className="dash-btn-primary"
              onClick={handleSaveCarte}
              disabled={updateProProfileMutation.isPending}
            >
              <FiSave /> Enregistrer les modifications
            </button>
          </div>
          {updateProProfileMutation.isPending && (
            <p className="dash-form-hint">Saving card updates...</p>
          )}
          {!updateProProfileMutation.isPending && cardSaveStatusMessage && (
            <p className="dash-form-hint">{cardSaveStatusMessage}</p>
          )}
        </form>

        {/* Aperçu de la carte */}
        <div className="dash-carte-apercu">
          <h3>Aperçu de votre carte</h3>
          <div className="marketplace-card">
            <div className="marketplace-badge">
              <FiZap /> Freelance
            </div>
            <div className="marketplace-left">
              <div className="marketplace-photo-wrapper">
                <img src={carteForm.photo} alt={carteForm.prenom} />
                <span className="marketplace-verified">
                  <FiCheckCircle />
                </span>
              </div>
              <h3 className="marketplace-name">
                {carteForm.prenom} {carteForm.nom}
              </h3>
              <p className="marketplace-specialite">{carteForm.specialization}</p>
              <div className="marketplace-location">
                <FiMapPin /> {carteForm.ville}, {carteForm.pays}
              </div>
              <div className="marketplace-rating">
                {renderStars(freelance.note)}
                <span>({freelance.nbAvis})</span>
              </div>
            </div>
            <div className="marketplace-right">
              <span
                className={`marketplace-dispo-badge ${
                  carteForm.disponible ? "disponible" : "indisponible"
                }`}
              >
                {carteForm.disponible ? "Disponible" : "Indisponible"}
              </span>
              <div className="marketplace-tarif">
                <FiDollarSign />
                <div>
                  <span className="marketplace-tarif-label">À partir de</span>
                  <span className="marketplace-tarif-value">
                    {carteForm.tarifHoraire
                      ? `${parseInt(carteForm.tarifHoraire.toString())} FCFA/h`
                      : "Tarif indisponible"}
                  </span>
                </div>
              </div>
              <div className="marketplace-actions">
                {carteForm.typeBouton === "contacter" && (
                  <button className="marketplace-btn-primary">
                    <FiMessageCircle /> Contacter
                  </button>
                )}
                {carteForm.typeBouton === "collaborer" && (
                  <button className="marketplace-btn-primary">
                    <FaHandshake /> Collaborer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProCardTab;
