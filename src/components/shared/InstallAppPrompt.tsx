import { useState } from "react";
import { X } from "lucide-react";
import { usePWAInstallPrompt } from "../../hooks/usePWAInstallPrompt";
import "./InstallAppPrompt.css";

export default function InstallAppPrompt() {
  const { canPromptInstall, isIOS, shouldShowPrompt, promptInstall, dismissPrompt } =
    usePWAInstallPrompt();
  const [isInstalling, setIsInstalling] = useState(false);

  if (!shouldShowPrompt) {
    return null;
  }

  const handleInstall = async () => {
    if (!canPromptInstall || isInstalling) {
      return;
    }

    setIsInstalling(true);
    try {
      await promptInstall();
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <aside
      className="install-prompt"
      role="dialog"
      aria-live="polite"
      aria-label="Installer l'application Jobty"
    >
      <section className="install-prompt__card">
        <button
          type="button"
          onClick={dismissPrompt}
          className="install-prompt__close"
          aria-label="Fermer la notification d'installation"
        >
          <X className="h-4 w-4" />
        </button>

        <header className="install-prompt__header">
          <h2 className="install-prompt__title">Installer Jobty</h2>
          <p className="install-prompt__description">
            {isIOS
              ? "Ajoutez Jobty a l'ecran d'accueil pour un acces rapide."
              : "Installez Jobty pour l'ouvrir rapidement depuis votre ecran d'accueil."}
          </p>
        </header>

        <div className="install-prompt__content">
          {isIOS ? (
            <div className="install-prompt__ios-note">
              Safari: Partager puis Ajouter a l'ecran d'accueil.
            </div>
          ) : null}

          <div className={isIOS ? "install-prompt__actions install-prompt__actions--stacked" : "install-prompt__actions"}>
            {!isIOS ? (
              <button
                type="button"
                onClick={handleInstall}
                disabled={!canPromptInstall || isInstalling}
                className="install-prompt__action install-prompt__action--primary"
              >
                {isInstalling ? "Installation..." : "Installer l'app"}
              </button>
            ) : null}

            <button
              type="button"
              onClick={dismissPrompt}
              className="install-prompt__action install-prompt__action--secondary"
            >
              Plus tard
            </button>
          </div>
        </div>
      </section>
    </aside>
  );
}
