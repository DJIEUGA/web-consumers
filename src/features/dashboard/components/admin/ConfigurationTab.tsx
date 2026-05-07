import React, { useState } from "react";
import { FiSettings, FiShield, FiBell, FiSave, FiRefreshCw } from "react-icons/fi";

const ConfigurationTab: React.FC = () => {
  const [notifSettings, setNotifSettings] = useState({
    emails: true,
    sms: true,
    push: false,
    newsletter: true,
  });

  return (
    <div className="admin-config-section">
      <div className="admin-section-header">
        <h2>Configuration de la plateforme</h2>
      </div>

      {/* Finance settings */}
      <div className="admin-config-card">
        <h3><FiSettings /> Finances</h3>
        <div className="admin-config-grid">
          <div className="admin-config-item">
            <label>Commission plateforme (%)</label>
            <input type="number" defaultValue={10} />
          </div>
          <div className="admin-config-item">
            <label>Seuil minimum projet (FCFA)</label>
            <input type="number" defaultValue={50000} />
          </div>
          <div className="admin-config-item">
            <label>Frais de retrait (FCFA)</label>
            <input type="number" defaultValue={500} />
          </div>
          <div className="admin-config-item">
            <label>Délai de séquestre (jours)</label>
            <input type="number" defaultValue={7} />
          </div>
        </div>
      </div>

      {/* Security settings */}
      <div className="admin-config-card">
        <h3><FiShield /> Sécurité</h3>
        <div className="admin-config-grid">
          <div className="admin-config-item">
            <label>KYC obligatoire pour</label>
            <select>
              <option>Projets &gt; 500k FCFA</option>
              <option>Tous les projets</option>
              <option>Désactivé</option>
            </select>
          </div>
          <div className="admin-config-item">
            <label>2FA obligatoire pour</label>
            <select>
              <option>Admins seulement</option>
              <option>Tous les utilisateurs</option>
              <option>Optionnel</option>
            </select>
          </div>
          <div className="admin-config-item">
            <label>Expiration sessions (jours)</label>
            <input type="number" defaultValue={30} />
          </div>
          <div className="admin-config-item">
            <label>Tentatives login max</label>
            <input type="number" defaultValue={5} />
          </div>
        </div>
      </div>

      {/* Notification toggles */}
      <div className="admin-config-card">
        <h3><FiBell /> Notifications</h3>
        <div className="admin-config-toggles">
          {(Object.keys(notifSettings) as Array<keyof typeof notifSettings>).map((key) => {
            const labels: Record<keyof typeof notifSettings, string> = {
              emails: "Emails transactionnels",
              sms: "SMS pour paiements",
              push: "Push notifications",
              newsletter: "Newsletter hebdomadaire",
            };
            return (
              <label key={key} className="admin-toggle">
                <input
                  type="checkbox"
                  checked={notifSettings[key]}
                  onChange={(e) => setNotifSettings({ ...notifSettings, [key]: e.target.checked })}
                />
                <span className="admin-toggle-slider" />
                <span>{labels[key]}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="admin-config-actions">
        <button className="dash-btn-primary">
          <FiSave /> Sauvegarder les modifications
        </button>
        <button className="dash-btn-secondary">
          <FiRefreshCw /> Réinitialiser
        </button>
      </div>
    </div>
  );
};

export default ConfigurationTab;
