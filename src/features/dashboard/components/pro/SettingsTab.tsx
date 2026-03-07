import React, { useMemo, useState } from "react";
import { FiBell, FiUser, FiLock, FiGlobe } from "react-icons/fi";
import {
  useAccountSettings,
  useUpdateAccountSettings,
} from "../../hooks/useAccountSettings";

type SettingsDraft = {
  emailNotificationsEnabled: boolean;
  collaborationAlertsEnabled: boolean;
  newFeaturesEnabled: boolean;
  financialTransactionsEnabled: boolean;
  messagesEnabled: boolean;
  reviewsEnabled: boolean;
  kycVerificationEnabled: boolean;
  accountActivationEnabled: boolean;
  accountReportEnabled: boolean;
  showPositionOnPublicProfile: boolean;
  appearInLocationSearch: boolean;
  showSpecializationTags: boolean;
  preferredLanguage: string;
};

const DEFAULT_SETTINGS: SettingsDraft = {
  emailNotificationsEnabled: false,
  collaborationAlertsEnabled: false,
  newFeaturesEnabled: false,
  financialTransactionsEnabled: false,
  messagesEnabled: false,
  reviewsEnabled: false,
  kycVerificationEnabled: false,
  accountActivationEnabled: false,
  accountReportEnabled: false,
  showPositionOnPublicProfile: false,
  appearInLocationSearch: false,
  showSpecializationTags: false,
  preferredLanguage: "FRE",
};

const NOTIFICATION_FIELDS: Array<{
  key: keyof Pick<
    SettingsDraft,
    | "emailNotificationsEnabled"
    | "collaborationAlertsEnabled"
    | "newFeaturesEnabled"
    | "financialTransactionsEnabled"
    | "messagesEnabled"
    | "reviewsEnabled"
    | "kycVerificationEnabled"
    | "accountActivationEnabled"
    | "accountReportEnabled"
  >;
  label: string;
}> = [
  { key: "emailNotificationsEnabled", label: "Notifications par e-mail" },
  { key: "collaborationAlertsEnabled", label: "Alertes de collaborations" },
  { key: "newFeaturesEnabled", label: "Nouvelles fonctionnalités" },
  { key: "financialTransactionsEnabled", label: "Transactions financières" },
  { key: "messagesEnabled", label: "Messages" },
  { key: "reviewsEnabled", label: "Notes et évaluations" },
  { key: "kycVerificationEnabled", label: "Vérification de compte" },
  { key: "accountActivationEnabled", label: "Activation de compte" },
  { key: "accountReportEnabled", label: "Signalement de compte" },
];

const PROFILE_FIELDS: Array<{
  key: keyof Pick<
    SettingsDraft,
    | "showPositionOnPublicProfile"
    | "appearInLocationSearch"
    | "showSpecializationTags"
  >;
  label: string;
}> = [
  {
    key: "showPositionOnPublicProfile",
    label: "Afficher ma position sur mon profil public",
  },
  {
    key: "appearInLocationSearch",
    label: "Apparaitre dans les résultats de recherche par localisation",
  },
  {
    key: "showSpecializationTags",
    label: "Afficher les tags de spécialisation sur le profil public",
  },
];

const LANGUAGE_OPTIONS: Array<{ value: SettingsDraft["preferredLanguage"]; label: string }> = [
  { value: "FRE", label: "Français" },
  { value: "ENG", label: "English" },
];

const toDraft = (accountSettings: any): SettingsDraft => ({
  emailNotificationsEnabled: !!accountSettings?.emailNotificationsEnabled,
  collaborationAlertsEnabled: !!accountSettings?.collaborationAlertsEnabled,
  newFeaturesEnabled: !!accountSettings?.newFeaturesEnabled,
  financialTransactionsEnabled: !!accountSettings?.financialTransactionsEnabled,
  messagesEnabled: !!accountSettings?.messagesEnabled,
  reviewsEnabled: !!accountSettings?.reviewsEnabled,
  kycVerificationEnabled: !!accountSettings?.kycVerificationEnabled,
  accountActivationEnabled: !!accountSettings?.accountActivationEnabled,
  accountReportEnabled: !!accountSettings?.accountReportEnabled,
  showPositionOnPublicProfile: !!accountSettings?.showPositionOnPublicProfile,
  appearInLocationSearch: !!accountSettings?.appearInLocationSearch,
  showSpecializationTags: !!accountSettings?.showSpecializationTags,
  preferredLanguage: accountSettings?.preferredLanguage || "FRE",
});

const SettingsTab: React.FC = () => {
  const [parametresSubTab, setParametresSubTab] = useState("notifications");
  const [overrides, setOverrides] = useState<Partial<SettingsDraft>>({});

  const {
    data: accountSettings,
    isLoading,
    isError,
    error,
  } = useAccountSettings();
  const updateSettingsMutation = useUpdateAccountSettings();

  const settingsDraft = useMemo(
    () => ({ ...(accountSettings ? toDraft(accountSettings) : DEFAULT_SETTINGS), ...overrides }),
    [accountSettings, overrides]
  );

  const isSaving = updateSettingsMutation.isPending;
  const hasChanges = useMemo(() => {
    if (!accountSettings) {
      return false;
    }

    return (
      settingsDraft.emailNotificationsEnabled !==
        !!accountSettings.emailNotificationsEnabled ||
      settingsDraft.collaborationAlertsEnabled !==
        !!accountSettings.collaborationAlertsEnabled ||
      settingsDraft.newFeaturesEnabled !== !!accountSettings.newFeaturesEnabled ||
      settingsDraft.financialTransactionsEnabled !==
        !!accountSettings.financialTransactionsEnabled ||
      settingsDraft.messagesEnabled !== !!accountSettings.messagesEnabled ||
      settingsDraft.reviewsEnabled !== !!accountSettings.reviewsEnabled ||
      settingsDraft.kycVerificationEnabled !==
        !!accountSettings.kycVerificationEnabled ||
      settingsDraft.accountActivationEnabled !==
        !!accountSettings.accountActivationEnabled ||
      settingsDraft.accountReportEnabled !== !!accountSettings.accountReportEnabled ||
      settingsDraft.showPositionOnPublicProfile !==
        !!accountSettings.showPositionOnPublicProfile ||
      settingsDraft.appearInLocationSearch !==
        !!accountSettings.appearInLocationSearch ||
      settingsDraft.showSpecializationTags !==
        !!accountSettings.showSpecializationTags ||
      settingsDraft.preferredLanguage !==
        (accountSettings.preferredLanguage || "FRE")
    );
  }, [accountSettings, settingsDraft]);

  const updateSetting = <K extends keyof SettingsDraft>(key: K, value: SettingsDraft[K]) => {
    setOverrides((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    await updateSettingsMutation.mutateAsync(settingsDraft);
    setOverrides({});
  };

  const errorMessage =
    (error as { message?: string; data?: { message?: string } })?.data?.message ||
    (error as { message?: string })?.message ||
    "Impossible de charger les paramètres.";

  return (
    <div className="dash-parametres-section">
      <div className="dash-section-header">
        <h2>Paramètres du compte</h2>
        <button
          className="dash-btn-primary"
          onClick={onSave}
          disabled={!hasChanges || isSaving || isLoading}
          style={{ opacity: !hasChanges || isSaving || isLoading ? 0.7 : 1 }}
        >
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>

      {isLoading && <p>Chargement des paramètres...</p>}
      {isError && <p>{errorMessage}</p>}

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
            {NOTIFICATION_FIELDS.map((field) => (
              <label key={field.key} className="dash-toggle">
                <input
                  type="checkbox"
                  checked={settingsDraft[field.key]}
                  disabled={isLoading || isSaving}
                  onChange={(e) =>
                    updateSetting(field.key, e.target.checked)
                  }
                />
                <span className="dash-toggle-slider"></span>
                <span className="dash-toggle-label">{field.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {parametresSubTab === "profil" && (
        <div className="dash-param-content">
          <h3>Configuration du profil</h3>
          <div className="dash-notif-settings">
            {PROFILE_FIELDS.map((field) => (
              <label key={field.key} className="dash-toggle">
                <input
                  type="checkbox"
                  checked={settingsDraft[field.key]}
                  disabled={isLoading || isSaving}
                  onChange={(e) =>
                    updateSetting(field.key, e.target.checked)
                  }
                />
                <span className="dash-toggle-slider"></span>
                <span className="dash-toggle-label">{field.label}</span>
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
            {LANGUAGE_OPTIONS.map((language) => (
              <label className="dash-radio" key={language.value}>
                <input
                  type="radio"
                  name="langue"
                  value={language.value}
                  checked={settingsDraft.preferredLanguage === language.value}
                  disabled={isLoading || isSaving}
                  onChange={() => updateSetting("preferredLanguage", language.value)}
                />
                <span>{language.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;
