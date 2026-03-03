import React, { useState } from "react";
import { FiBell, FiUser, FiLock, FiGlobe } from "react-icons/fi";

const SettingsTab: React.FC = () => {
  const [parametresSubTab, setParametresSubTab] = useState("notifications");
  const [notifSettings, setNotifSettings] = useState({
    email: true,
    collaborations: true,
    nouveautes: false,
    transactions: true,
    messages: true,
    evaluations: true,
    verification: true,
    activation: true,
    signalement: true,
  });

  const [profilSettings, setProfilSettings] = useState({
    afficherPosition: true,
    rechercheLocalisation: true,
    afficherTags: false,
  });

  return (
    <div className="dash-parametres-section">
      <div className="dash-section-header">
        <h2>Paramètres du compte</h2>
      </div>

      <div className="dash-param-menu">
        <button
          className={`dash-param-menu-item ${parametresSubTab === "notifications" ? "active" : ""}`}
          onClick={() => setParametresSubTab("notifications")}
        >
          <FiBell /> Notifications
        </button>
        <button
          className={`dash-param-menu-item ${parametresSubTab === "profil" ? "active" : ""}`}
          onClick={() => setParametresSubTab("profil")}
        >
          <FiUser /> Profil
        </button>
        <button
          className={`dash-param-menu-item ${parametresSubTab === "securite" ? "active" : ""}`}
          onClick={() => setParametresSubTab("securite")}
        >
          <FiLock /> Sécurité
        </button>
        <button
          className={`dash-param-menu-item ${parametresSubTab === "langue" ? "active" : ""}`}
          onClick={() => setParametresSubTab("langue")}
        >
          <FiGlobe /> Langue
        </button>
      </div>

      {parametresSubTab === "notifications" && (
        <div className="dash-param-content">
          <h3>Gérer les notifications</h3>
          <div className="dash-notif-settings">
            {Object.keys(notifSettings).map((key) => (
              <label key={key} className="dash-toggle">
                <input
                  type="checkbox"
                  checked={notifSettings[key]}
                  onChange={(e) =>
                    setNotifSettings({
                      ...notifSettings,
                      [key]: e.target.checked,
                    })
                  }
                />
                <span className="dash-toggle-slider"></span>
                <span className="dash-toggle-label">
                  {key === "email" && "Notifications par e-mail"}
                  {key === "collaborations" && "Alertes de collaborations"}
                  {key === "nouveautes" && "Nouvelles fonctionnalités"}
                  {key === "transactions" && "Transactions financières"}
                  {key === "messages" && "Messages"}
                  {key === "evaluations" && "Notes et évaluations"}
                  {key === "verification" && "Vérification de compte"}
                  {key === "activation" && "Activation de compte"}
                  {key === "signalement" && "Signalement de compte"}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {parametresSubTab === "profil" && (
        <div className="dash-param-content">
          <h3>Configuration du profil</h3>
          <div className="dash-notif-settings">
            {Object.keys(profilSettings).map((key) => (
              <label key={key} className="dash-toggle">
                <input
                  type="checkbox"
                  checked={profilSettings[key]}
                  onChange={(e) =>
                    setProfilSettings({
                      ...profilSettings,
                      [key]: e.target.checked,
                    })
                  }
                />
                <span className="dash-toggle-slider"></span>
                <span className="dash-toggle-label">
                  {key === "afficherPosition" &&
                    "Afficher ma position sur mon profil public"}
                  {key === "rechercheLocalisation" &&
                    "Apparaitre dans les résultats de recherche par localisation"}
                  {key === "afficherTags" &&
                    "Afficher les tags de spécialisation sur le profil public"}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {parametresSubTab === "securite" && (
        <div className="dash-param-content">
          <h3>Sécurité et mot de passe</h3>
          <div className="dash-form-group">
            <label>Mot de passe actuel</label>
            <input type="password" />
          </div>
          <div className="dash-form-group">
            <label>Nouveau mot de passe</label>
            <input type="password" />
          </div>
          <div className="dash-form-group">
            <label>Confirmer le mot de passe</label>
            <input type="password" />
          </div>
          <button className="dash-btn-primary">Modifier le mot de passe</button>

          <hr style={{ margin: "30px 0" }} />

          <h3>Authentification à double facteur</h3>
          <label className="dash-toggle">
            <input type="checkbox" />
            <span className="dash-toggle-slider"></span>
            <span className="dash-toggle-label">
              Activer l'authentification à deux facteurs
            </span>
          </label>
        </div>
      )}

      {parametresSubTab === "langue" && (
        <div className="dash-param-content">
          <h3>Langue de navigation</h3>
          <div className="dash-radio-group">
            <label className="dash-radio">
              <input type="radio" name="langue" value="fr" defaultChecked />
              <span>Français</span>
            </label>
            <label className="dash-radio">
              <input type="radio" name="langue" value="en" />
              <span>English</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;
